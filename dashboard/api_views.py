import json
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from .models import Container, ContainerConfig, UserProfile
from .serializers import ContainerSerializer, UserSerializer, ContainerConfigSerializer
from .throttles import UserProfileQuotaThrottle
import google.generativeai as genai

from .ai_service import get_model


def decrement_api_quota(user):
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return
    if profile.api_quota > 0:
        profile.api_quota -= 1
        profile.save()


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ContainerConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_groups = set(request.user.groups.values_list('name', flat=True))
        configs = ContainerConfig.objects.filter(is_active=True).order_by('order')
        allowed_configs = [
            cfg for cfg in configs
            if not cfg.allowed_roles or user_groups.intersection(cfg.allowed_roles)
        ]
        serializer = ContainerConfigSerializer(allowed_configs, many=True)
        return Response(serializer.data)


class IsContainerOwner(BasePermission):
    """Allow access only to the container owner for modifying actions."""

    def has_object_permission(self, request, view, obj):
        restricted = {
            "update",
            "partial_update",
            "destroy",
            "suggest_questions",
            "suggest_personas",
            "generate_function",
            "chat",
        }
        if getattr(view, "action", None) in restricted:
            return obj.owner == request.user
        return True


class ContainerViewSet(viewsets.ModelViewSet):
    serializer_class = ContainerSerializer
    permission_classes = [IsAuthenticated, IsContainerOwner]

    def get_queryset(self):
        return Container.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        # When a new container is created, set the owner and add them as a member.
        container = serializer.save(owner=self.request.user)
        container.members.add(self.request.user)

    def _call_gemini_suggestion(self, request, prompt):
        try:
            model = get_model('gemini-2.5-flash')
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            decrement_api_quota(request.user)
            return Response(json.loads(response.text))
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def suggest_questions(self, request, pk=None):
        container = self.get_object()
        prompt = f"Based on a container named '{container.name}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries. Return as a JSON object with a 'suggestions' key containing an array of strings."
        return self._call_gemini_suggestion(request, prompt)

    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def suggest_personas(self, request, pk=None):
        container = self.get_object()
        prompt = f"Based on a container named '{container.name}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide'. Return as a JSON object with a 'suggestions' key containing an array of strings."
        return self._call_gemini_suggestion(request, prompt)
    
    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def generate_function(self, request, pk=None):
        user_request = request.data.get('prompt', '')
        if not user_request:
            return Response({"error": "Prompt is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = f"""
        Based on the user request for a function: "{user_request}", generate a configuration for it. The function should run inside a chat application.
        - Define a short, clear 'name'.
        - Write a concise one-sentence 'description'.
        - Select a suitable SVG 'icon' from the provided list.
        - Define 1 to 3 input 'parameters' the user needs to provide (name, type, description). Parameter 'type' must be one of: 'string', 'number', 'textarea'.
        - Create a detailed 'promptTemplate' to be sent to another AI model. The prompt template must use placeholders like {{{{parameterName}}}} for each parameter defined.
        Return as a single JSON object.

        Available icons:
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        """
        return self._call_gemini_suggestion(request, prompt)


    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def chat(self, request, pk=None):
        container = self.get_object()
        message = request.data.get('message', '')
        history_from_client = request.data.get('history', [])

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Convert client history to the format required by the Python SDK
            sdk_history = []
            for item in history_from_client:
                role = 'model' if item.get('role') == 'model' else 'user'
                sdk_history.append({
                    'role': role,
                    'parts': [item.get('text', '')]
                })

            model = get_model(
                container.selectedModel,
                system_instruction=(
                    f"You are an assistant for the {container.name} container. Your persona is {container.selectedPersona}."
                ),
            )
            chat = model.start_chat(history=sdk_history)

            response = chat.send_message(message)
            decrement_api_quota(request.user)

            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

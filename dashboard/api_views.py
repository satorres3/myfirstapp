from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Container, ContainerConfig
from .serializers import (
    ContainerConfigSerializer,
    ContainerSerializer,
    UserSerializer,
)
from .tasks import chat_task, gemini_suggestion_task
from .throttles import UserProfileQuotaThrottle
from celery.result import AsyncResult




class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Return serialized data for the authenticated user."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ContainerConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        """Return active container configurations accessible to the user."""
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

    def has_object_permission(
        self, request: Request, view: viewsets.ViewSet, obj: Container
    ) -> bool:
        """Check whether the request user owns the container for restricted actions."""
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

    def get_queryset(self) -> QuerySet[Container]:
        """Return containers for which the user is a member."""
        return Container.objects.filter(members=self.request.user)

    def perform_create(self, serializer: ContainerSerializer) -> None:
        """Set the owner and add them as a member when creating a container."""
        container = serializer.save(owner=self.request.user)
        container.members.add(self.request.user)

    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def suggest_questions(self, request: Request, pk: int | None = None) -> Response:
        """Queue a task to suggest quick questions for the container."""
        container = self.get_object()
        prompt = f"Based on a container named '{container.name}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries. Return as a JSON object with a 'suggestions' key containing an array of strings."
        task = gemini_suggestion_task.delay(request.user.id, prompt)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)

    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def suggest_personas(self, request: Request, pk: int | None = None) -> Response:
        """Queue a task to suggest personas for the container."""
        container = self.get_object()
        prompt = f"Based on a container named '{container.name}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide'. Return as a JSON object with a 'suggestions' key containing an array of strings."
        task = gemini_suggestion_task.delay(request.user.id, prompt)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)
    
    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def generate_function(self, request: Request, pk: int | None = None) -> Response:
        """Queue a task to generate a function configuration from a prompt."""
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
        task = gemini_suggestion_task.delay(request.user.id, prompt)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)


    @action(detail=True, methods=['post'], throttle_classes=[UserProfileQuotaThrottle])
    def chat(self, request: Request, pk: int | None = None) -> Response:
        """Queue a chat task for a container with the provided message and history."""
        container = self.get_object()
        message = request.data.get('message', '')
        history_from_client = request.data.get('history', [])

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        task = chat_task.delay(request.user.id, container.id, message, history_from_client)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)


class TaskStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, task_id: str) -> Response:
        """Return the status and result (if ready) of a Celery task."""
        result = AsyncResult(task_id)
        if result.successful():
            return Response({"status": result.status, "result": result.result})
        return Response({"status": result.status})

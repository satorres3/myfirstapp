
import os
import json
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Department
from .serializers import DepartmentSerializer
import google.generativeai as genai

# --- Gemini AI Setup ---
try:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    else:
        print("Warning: GOOGLE_API_KEY environment variable not set. AI features will be disabled.")
except Exception as e:
    print(f"Could not configure GoogleGenAI: {e}")


class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Department.objects.filter(members=self.request.user)

    def perform_create(self, serializer):
        # When a new department is created, set the owner and add them as a member.
        department = serializer.save(owner=self.request.user)
        department.members.add(self.request.user)

    def _call_gemini_suggestion(self, prompt):
        if not os.environ.get("GOOGLE_API_KEY"):
            return Response({"error": "Gemini AI not configured on the server"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    response_mime_type="application/json"
                )
            )
            return Response(json.loads(response.text))
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def suggest_questions(self, request, pk=None):
        department = self.get_object()
        prompt = f"Based on a container named '{department.name}', generate 4 diverse and insightful 'quick questions' a user might ask an AI assistant in this context. Focus on actionable and common queries. Return as a JSON object with a 'suggestions' key containing an array of strings."
        return self._call_gemini_suggestion(prompt)

    @action(detail=True, methods=['post'])
    def suggest_personas(self, request, pk=None):
        department = self.get_object()
        prompt = f"Based on a container named '{department.name}', generate 4 creative and distinct 'personas' for an AI assistant. Examples: 'Concise Expert', 'Friendly Guide'. Return as a JSON object with a 'suggestions' key containing an array of strings."
        return self._call_gemini_suggestion(prompt)
    
    @action(detail=True, methods=['post'])
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
        return self._call_gemini_suggestion(prompt)


    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        department = self.get_object()
        message = request.data.get('message', '')
        history_from_client = request.data.get('history', [])

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not os.environ.get("GOOGLE_API_KEY"):
            return Response({"error": "Gemini AI not configured on the server"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # Convert client history to the format required by the Python SDK
            sdk_history = []
            for item in history_from_client:
                role = 'model' if item.get('role') == 'model' else 'user'
                sdk_history.append({
                    'role': role,
                    'parts': [item.get('text', '')]
                })

            model = genai.GenerativeModel(
                model_name=department.selectedModel,
                system_instruction=f"You are an assistant for the {department.name} container. Your persona is {department.selectedPersona}."
            )
            chat = model.start_chat(history=sdk_history)
            
            response = chat.send_message(message)

            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Department
from .serializers import DepartmentSerializer
from google.generativeai.client import GoogleGenAI
from google.generativeai.types import GenerateContentResponse, Part, Content
from google.generativeai.generative_models import ChatSession
from google.generativeai.types.helper_types import Tool, FunctionDeclaration
from google.generativeai.types.content_types import ContentDict, PartDict, ToolDict, FunctionDeclarationDict, FunctionCallDict, FunctionResponseDict
import json

# --- Gemini AI Setup ---
try:
    ai = GoogleGenAI(api_key=os.environ.get("GOOGLE_API_KEY"))
except Exception as e:
    ai = None
    print(f"Could not initialize GoogleGenAI: {e}")


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
        if not ai:
            return Response({"error": "Gemini AI not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            response = ai.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                generation_config={"response_mime_type": "application/json"},
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
        - Create a detailed 'promptTemplate' to be sent to another AI model. The prompt template must use placeholders like {{parameterName}} for each parameter defined.
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
        history = request.data.get('history', [])

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not ai:
            return Response({"error": "Gemini AI not configured"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            model = ai.get_generative_model(model=department.selectedModel)
            chat = model.start_chat(history=history)
            
            response = chat.send_message(message)

            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

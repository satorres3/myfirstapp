import json
from celery import shared_task
import google.generativeai as genai
from django.contrib.auth import get_user_model

from .ai_service import get_model
from .utils import decrement_api_quota
from .models import Container


@shared_task
def gemini_suggestion_task(user_id, prompt):
    user = get_user_model().objects.get(pk=user_id)
    model = get_model('gemini-2.5-flash')
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json"
        ),
    )
    decrement_api_quota(user)
    return json.loads(response.text)


@shared_task
def chat_task(user_id, container_id, message, history_from_client):
    container = Container.objects.get(pk=container_id)
    sdk_history = []
    for item in history_from_client:
        role = 'model' if item.get('role') == 'model' else 'user'
        sdk_history.append({'role': role, 'parts': [item.get('text', '')]})
    model = get_model(
        container.selectedModel,
        system_instruction=(
            f"You are an assistant for the {container.name} container. Your persona is {container.selectedPersona}."
        ),
    )
    chat = model.start_chat(history=sdk_history)
    response = chat.send_message(message)
    user = get_user_model().objects.get(pk=user_id)
    decrement_api_quota(user)
    return {"reply": response.text}

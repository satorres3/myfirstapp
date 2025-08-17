import logging
from django.core.cache import cache

from .ai_service import call_gemini, is_configured, genai, time

logger = logging.getLogger(__name__)


def generate_greeting(name: str) -> str:
    """Return a personalized greeting for the given user name.

    Results are cached to avoid excessive API requests.
    """
    cache_key = f"ai_greeting:{name}"
    greeting = cache.get(cache_key)
    if greeting:
        return greeting

    # Fallback if API key isn't configured
    if not is_configured():
        greeting = f"Welcome back, {name}!"
        cache.set(cache_key, greeting, 3600)
        return greeting

    prompt = f"Craft a short, warm greeting for a user named {name}."
    try:
        greeting = call_gemini(prompt)
    except Exception as e:
        logger.warning(f"AI greeting generation failed: {e}")
        greeting = f"Welcome back, {name}!"

    cache.set(cache_key, greeting, 3600)
    return greeting

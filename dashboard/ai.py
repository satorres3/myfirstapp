import os
import logging
from django.core.cache import cache
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Configure the Gemini API if possible
try:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
    else:
        logger.warning("GOOGLE_API_KEY environment variable not set. AI features will be disabled.")
except Exception as e:
    logger.warning(f"Could not configure GoogleGenAI: {e}")


def generate_greeting(name: str) -> str:
    """Return a personalized greeting for the given user name.

    Results are cached to avoid excessive API requests.
    """
    cache_key = f"ai_greeting:{name}"
    greeting = cache.get(cache_key)
    if greeting:
        return greeting

    # Fallback if API key isn't configured
    if not os.environ.get("GOOGLE_API_KEY"):
        greeting = f"Welcome back, {name}!"
        cache.set(cache_key, greeting, 3600)
        return greeting

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Craft a short, warm greeting for a user named {name}."
        response = model.generate_content(prompt)
        greeting = response.text.strip()
    except Exception as e:
        logger.warning(f"AI greeting generation failed: {e}")
        greeting = f"Welcome back, {name}!"

    cache.set(cache_key, greeting, 3600)
    return greeting

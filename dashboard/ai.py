import os
import logging
import time
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


def call_gemini(prompt: str, model_name: str = "gemini-1.5-flash", *, timeout: int = 10, max_retries: int = 3) -> str:
    """Call Gemini with retries and timeout.

    Raises the last exception if all retries fail.
    """

    if not os.environ.get("GOOGLE_API_KEY"):
        raise RuntimeError("Gemini AI not configured")

    delay = 1
    for attempt in range(max_retries):
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt, request_options={"timeout": timeout})
            return response.text.strip()
        except Exception as e:
            logger.warning(
                "Gemini call failed (attempt %d/%d): %s", attempt + 1, max_retries, e
            )
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
            delay *= 2


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

    prompt = f"Craft a short, warm greeting for a user named {name}."
    try:
        greeting = call_gemini(prompt)
    except Exception as e:
        logger.warning(f"AI greeting generation failed: {e}")
        greeting = f"Welcome back, {name}!"

    cache.set(cache_key, greeting, 3600)
    return greeting

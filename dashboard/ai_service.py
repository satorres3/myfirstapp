"""Helper utilities for interacting with the Gemini API.

This module centralizes configuration of the Google Generative AI SDK and
provides helper functions used throughout the dashboard app.  Modules should
import from here rather than configuring Gemini individually.
"""

import logging
import os
import time

import google.generativeai as genai

logger = logging.getLogger(__name__)


_configured = False


def configure() -> bool:
    """Configure the Gemini SDK using ``GOOGLE_API_KEY`` if available.

    Returns ``True`` if configuration succeeded, otherwise logs a warning and
    returns ``False``.
    """

    global _configured
    api_key = os.environ.get("GOOGLE_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        _configured = True
    else:
        logger.warning(
            "GOOGLE_API_KEY environment variable not set. AI features will be disabled."
        )
        _configured = False
    return _configured


# Initial configuration attempt on import
configure()


def is_configured() -> bool:
    """Return ``True`` if a Google API key is currently available."""

    return bool(os.environ.get("GOOGLE_API_KEY"))


def get_model(model_name: str, **kwargs) -> genai.GenerativeModel:
    """Return a configured ``GenerativeModel`` instance.

    Raises ``RuntimeError`` with a meaningful message if the API key is
    missing.
    """

    if not is_configured():
        raise RuntimeError("Gemini AI not configured: missing GOOGLE_API_KEY")

    if not _configured:
        configure()

    return genai.GenerativeModel(model_name, **kwargs)


def call_gemini(
    prompt: str,
    model_name: str = "gemini-1.5-flash",
    *,
    timeout: int = 10,
    max_retries: int = 3,
) -> str:
    """Call Gemini with retries and timeout.

    Raises the last exception if all retries fail or if the API key is
    missing.
    """

    delay = 1
    for attempt in range(max_retries):
        try:
            model = get_model(model_name)
            response = model.generate_content(
                prompt, request_options={"timeout": timeout}
            )
            return response.text.strip()
        except Exception as e:
            logger.warning(
                "Gemini call failed (attempt %d/%d): %s", attempt + 1, max_retries, e
            )
            if attempt == max_retries - 1:
                raise
            time.sleep(delay)
            delay *= 2


__all__ = [
    "call_gemini",
    "configure",
    "get_model",
    "genai",
    "is_configured",
    "time",
]


import os
from unittest import mock

import pytest

from dashboard import ai


@pytest.fixture(autouse=True)
def clear_cache():
    from django.core.cache import cache
    cache.clear()


def test_call_gemini_retries_on_failure(monkeypatch):
    os.environ["GOOGLE_API_KEY"] = "dummy"

    model_instance = mock.Mock()
    responses = [TimeoutError("boom"), TimeoutError("boom"), mock.Mock(text="hi")]
    model_instance.generate_content.side_effect = responses

    monkeypatch.setattr(ai.genai, "GenerativeModel", lambda *a, **k: model_instance)

    sleeps = []
    monkeypatch.setattr(ai.time, "sleep", lambda s: sleeps.append(s))

    result = ai.call_gemini("hello")
    assert result == "hi"
    assert model_instance.generate_content.call_count == 3
    assert sleeps == [1, 2]


def test_generate_greeting_fallback(monkeypatch):
    os.environ["GOOGLE_API_KEY"] = "dummy"
    monkeypatch.setattr(ai, "call_gemini", mock.Mock(side_effect=Exception("fail")))

    greeting = ai.generate_greeting("Alice")
    assert greeting == "Welcome back, Alice!"

import os
from types import SimpleNamespace
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from dashboard.api_views import ContainerViewSet
from dashboard.models import Container
from django.core.cache import cache


class TestGeminiSuggestionCaching(TestCase):
    def setUp(self):
        os.environ['GOOGLE_API_KEY'] = 'dummy'
        self.user = User.objects.create_user(username='u', password='p')
        self.container = Container.objects.create(name='C', owner=self.user)
        self.container.members.add(self.user)
        self.factory = APIRequestFactory()
        request = self.factory.post('/')
        request.user = self.user
        self.viewset = ContainerViewSet()
        self.viewset.request = request
        cache.clear()

    @patch('dashboard.api_views.call_gemini')
    def test_cache_prevents_duplicate_api_calls(self, mock_call):
        mock_call.return_value = '{"suggestions": ["a", "b"]}'
        prompt = 'p'
        first = self.viewset._call_gemini_suggestion(self.container, 'test', prompt)
        second = self.viewset._call_gemini_suggestion(self.container, 'test', prompt)
        self.assertEqual(first, {"suggestions": ["a", "b"]})
        self.assertEqual(first, second)
        mock_call.assert_called_once_with(prompt, model_name='gemini-2.5-flash')

from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.core.cache import cache
from unittest.mock import patch
import os

from .models import Container, SiteBranding
from .context_processors import site_branding


class ContainersListViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass123")
        Container.objects.create(name="Test Container", owner=self.user)

    def test_redirects_when_not_logged_in(self):
        response = self.client.get(reverse('dashboard:containers_list'))
        self.assertRedirects(response, reverse('login'))

    def test_lists_containers_when_logged_in(self):
        self.client.login(username="tester", password="pass123")
        response = self.client.get(reverse('dashboard:containers_list'))
        self.assertContains(response, "Test Container")


class HubViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass123")

    @patch('dashboard.views.generate_greeting', return_value="Hello tester!")
    def test_hub_view_uses_ai_greeting(self, mock_greeting):
        self.client.login(username="tester", password="pass123")
        response = self.client.get(reverse('dashboard:hub'))
        self.assertContains(response, "Hello tester!")
        mock_greeting.assert_called_once_with("tester")


class GenerateGreetingCacheTests(TestCase):
    @patch.dict(os.environ, {"GOOGLE_API_KEY": "test"})
    @patch('dashboard.ai.genai.GenerativeModel')
    def test_generate_greeting_cached(self, mock_model):
        mock_instance = mock_model.return_value
        mock_instance.generate_content.return_value.text = "Hi Bob!"
        cache.clear()
        from dashboard.ai import generate_greeting

        generate_greeting("Bob")
        generate_greeting("Bob")
        mock_instance.generate_content.assert_called_once()


class SiteBrandingContextProcessorTests(TestCase):
    def test_returns_first_branding(self):
        branding = SiteBranding.objects.create()
        context = site_branding(None)
        self.assertEqual(context["site_branding"], branding)


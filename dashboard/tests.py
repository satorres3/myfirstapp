from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User, Group
from django.core.cache import cache
from unittest.mock import patch
import os

from rest_framework.test import APITestCase

from .models import Container, SiteBranding, ContainerConfig
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


class ContainerConfigAPITests(APITestCase):
    def setUp(self):
        self.admin_group = Group.objects.create(name="admin")
        self.user_group = Group.objects.create(name="user")
        self.user = User.objects.create_user(username="tester", password="pass123")
        self.user.groups.add(self.admin_group)

        ContainerConfig.objects.create(
            key="public",
            name="Public",
            icon="public-icon",
            route="/public",
            allowed_roles=[],
            is_active=True,
            order=1,
        )
        ContainerConfig.objects.create(
            key="admin",
            name="Admin Only",
            icon="admin-icon",
            route="/admin",
            allowed_roles=["admin"],
            is_active=True,
            order=2,
        )
        ContainerConfig.objects.create(
            key="user",
            name="User Only",
            icon="user-icon",
            route="/user",
            allowed_roles=["user"],
            is_active=True,
            order=3,
        )
        ContainerConfig.objects.create(
            key="inactive",
            name="Inactive",
            icon="inactive-icon",
            route="/inactive",
            allowed_roles=["admin"],
            is_active=False,
            order=4,
        )

    def test_user_only_sees_configs_for_their_groups(self):
        self.client.login(username="tester", password="pass123")
        response = self.client.get(reverse("container-configs"))
        self.assertEqual(response.status_code, 200)
        configs = response.json()
        names = [cfg["name"] for cfg in configs]
        routes = [cfg["route"] for cfg in configs]
        icons = [cfg["icon"] for cfg in configs]
        self.assertEqual(names, ["Public", "Admin Only"])
        self.assertEqual(routes, ["/public", "/admin"])
        self.assertEqual(icons, ["public-icon", "admin-icon"])


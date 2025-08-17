import os
from unittest.mock import patch, Mock

from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from dashboard.models import Container, UserProfile
from django.core.cache import cache


class TestAPIQuota(APITestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(username="u", password="pass")
        self.container = Container.objects.create(name="C", owner=self.user)
        self.container.members.add(self.user)
        self.url = reverse('container-suggest-questions', args=[self.container.id])

    @patch('dashboard.api_views.genai.GenerativeModel')
    def test_quota_decrements_on_success(self, mock_model):
        os.environ['GOOGLE_API_KEY'] = 'dummy'
        instance = mock_model.return_value
        instance.generate_content.return_value = Mock(text='{}')
        UserProfile.objects.create(user=self.user, api_quota=2)
        self.client.login(username="u", password="pass")
        self.client.post(self.url)
        profile = UserProfile.objects.get(user=self.user)
        assert profile.api_quota == 1

    @patch('dashboard.api_views.genai.GenerativeModel')
    def test_quota_enforced_when_exhausted(self, mock_model):
        os.environ['GOOGLE_API_KEY'] = 'dummy'
        instance = mock_model.return_value
        instance.generate_content.return_value = Mock(text='{}')
        UserProfile.objects.create(user=self.user, api_quota=0)
        self.client.login(username="u", password="pass")
        response = self.client.post(self.url)
        assert response.status_code == 429
        assert instance.generate_content.call_count == 0

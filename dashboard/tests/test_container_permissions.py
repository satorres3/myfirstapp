from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock

from dashboard.models import Container


class TestContainerPermissions(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username="owner", password="pass")
        self.member = User.objects.create_user(username="member", password="pass")
        self.container = Container.objects.create(name="Test Container", owner=self.owner)
        self.container.members.add(self.owner, self.member)

    def test_owner_can_update_and_destroy(self):
        self.client.login(username="owner", password="pass")
        url = reverse('container-detail', args=[self.container.id])
        response = self.client.patch(url, {"name": "Updated"}, format='json')
        self.assertEqual(response.status_code, 200)
        self.container.refresh_from_db()
        self.assertEqual(self.container.name, "Updated")

        response = self.client.delete(url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Container.objects.filter(id=self.container.id).exists())

    def test_non_owner_cannot_update_or_destroy(self):
        self.client.login(username="member", password="pass")
        url = reverse('container-detail', args=[self.container.id])
        response = self.client.patch(url, {"name": "Updated"}, format='json')
        self.assertEqual(response.status_code, 403)
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 403)
        self.assertTrue(Container.objects.filter(id=self.container.id).exists())

    @patch('dashboard.tasks.gemini_suggestion_task.delay')
    def test_owner_can_access_custom_action(self, mock_delay):
        mock_delay.return_value = MagicMock(id='123')
        self.client.login(username="owner", password="pass")
        url = reverse('container-suggest-questions', args=[self.container.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 202)
        self.assertIn('task_id', response.data)

    @patch('dashboard.tasks.gemini_suggestion_task.delay')
    def test_non_owner_cannot_access_custom_action(self, mock_delay):
        self.client.login(username="member", password="pass")
        url = reverse('container-suggest-questions', args=[self.container.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 403)
        mock_delay.assert_not_called()

from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from unittest.mock import patch, MagicMock


class TestTaskStatus(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="u", password="p")

    @patch('dashboard.api_views.AsyncResult')
    def test_task_status_endpoint(self, mock_async):
        mock_result = MagicMock()
        mock_result.status = 'SUCCESS'
        mock_result.result = {'data': 'ok'}
        mock_async.return_value = mock_result
        self.client.login(username="u", password="p")
        url = reverse('task-status', args=['abc'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'SUCCESS')
        self.assertEqual(response.data['result'], {'data': 'ok'})

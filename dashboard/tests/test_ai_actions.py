import os
from types import SimpleNamespace
from unittest.mock import patch, MagicMock

from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase

from dashboard.models import Container


class TestGeminiActions(APITestCase):
    def setUp(self):
        os.environ['GOOGLE_API_KEY'] = 'dummy'
        self.owner = User.objects.create_user(username='owner', password='pass')
        self.other = User.objects.create_user(username='other', password='pass')
        self.container = Container.objects.create(name='C', owner=self.owner)
        self.container.members.add(self.owner, self.other)

    @patch('dashboard.api_views.call_gemini')
    def test_suggest_questions_success(self, mock_call):
        mock_call.return_value = '{"suggestions": ["a"]}'
        self.client.login(username='owner', password='pass')
        url = reverse('container-suggest-questions', args=[self.container.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {"suggestions": ["a"]})
        mock_call.assert_called_once()

    @patch('dashboard.api_views.call_gemini')
    def test_suggest_personas_success(self, mock_call):
        mock_call.return_value = '{"suggestions": ["p"]}'
        self.client.login(username='owner', password='pass')
        url = reverse('container-suggest-personas', args=[self.container.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {"suggestions": ["p"]})
        mock_call.assert_called_once()

    @patch('dashboard.api_views.call_gemini')
    def test_generate_function_success_and_error(self, mock_call):
        mock_call.return_value = '{"foo": 1}'
        self.client.login(username='owner', password='pass')
        url = reverse('container-generate-function', args=[self.container.id])
        resp = self.client.post(url, {'prompt': 'do x'}, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data, {"foo": 1})
        mock_call.assert_called_once()

        mock_call.reset_mock()
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('error', resp.data)
        mock_call.assert_not_called()

    @patch('dashboard.tasks.genai.GenerativeModel')
    @patch('dashboard.tasks.chat_task.delay')
    def test_chat_success_and_error(self, mock_delay, mock_model):
        mock_delay.return_value = SimpleNamespace(id='t4')
        self.client.login(username='owner', password='pass')
        url = reverse('container-chat', args=[self.container.id])
        resp = self.client.post(url, {'message': 'hi', 'history': []}, format='json')
        self.assertEqual(resp.status_code, 202)
        self.assertEqual(resp.data['task_id'], 't4')
        mock_delay.assert_called_once()

        mock_delay.reset_mock()
        resp = self.client.post(url, {}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('error', resp.data)
        mock_delay.assert_not_called()

    def test_unauthorized_access_rejected(self):
        # test each restricted action for non-owner
        self.client.login(username='other', password='pass')
        actions = [
            ('container-suggest-questions', {}),
            ('container-suggest-personas', {}),
            ('container-chat', {'message': 'hi'}),
        ]
        for name, data in actions:
            url = reverse(name, args=[self.container.id])
            resp = self.client.post(url, data, format='json')
            self.assertEqual(resp.status_code, 403)

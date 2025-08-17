from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from unittest.mock import patch

class LoginRedirectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass123")

    def test_redirects_to_hub_when_no_next(self):
        response = self.client.post(reverse('login'), {
            'username': 'tester',
            'password': 'pass123',
        })
        self.assertRedirects(response, reverse('dashboard:hub'))


class AuthBackendTests(TestCase):
    def setUp(self):
        UserModel = get_user_model()
        self.user = UserModel.objects.create_user(
            username='tester',
            email='test@example.com',
            password='irrelevant'
        )

    @patch('django.contrib.auth.models.User.check_password', return_value=True)
    def test_authenticate_with_username(self, mock_check_password):
        user = authenticate(username='tester', password='secret')
        self.assertEqual(user, self.user)

    @patch('django.contrib.auth.models.User.check_password', return_value=True)
    def test_authenticate_with_email_case_insensitive(self, mock_check_password):
        user = authenticate(username='TEST@EXAMPLE.COM', password='secret')
        self.assertEqual(user, self.user)

    @patch('django.contrib.auth.models.User.check_password', return_value=False)
    def test_authentication_failed(self, mock_check_password):
        user = authenticate(username='tester', password='wrong')
        self.assertIsNone(user)

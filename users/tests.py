from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

class LoginRedirectTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass123")

    def test_redirects_to_hub_when_no_next(self):
        response = self.client.post(reverse('login'), {
            'username': 'tester',
            'password': 'pass123',
        })
        self.assertRedirects(response, reverse('dashboard:hub'))

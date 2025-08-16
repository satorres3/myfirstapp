from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User

from .models import Container


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

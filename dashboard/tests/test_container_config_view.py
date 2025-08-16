from django.urls import reverse
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase

from dashboard.models import ContainerConfig


class TestContainerConfigView(APITestCase):
    def setUp(self):
        self.group_admin = Group.objects.create(name="admin")
        self.group_user = Group.objects.create(name="user")
        self.user = User.objects.create_user(username="tester", password="pass123")
        self.user.groups.add(self.group_admin)

        ContainerConfig.objects.create(
            key="public",
            name="Public",
            route="/public",
            allowed_roles=[],
            is_active=True,
            order=1,
        )
        ContainerConfig.objects.create(
            key="admin",
            name="Admin Only",
            route="/admin",
            allowed_roles=["admin"],
            is_active=True,
            order=2,
        )
        ContainerConfig.objects.create(
            key="user",
            name="User Only",
            route="/user",
            allowed_roles=["user"],
            is_active=True,
            order=3,
        )
        ContainerConfig.objects.create(
            key="inactive",
            name="Inactive",
            route="/inactive",
            allowed_roles=["admin"],
            is_active=False,
            order=4,
        )

    def test_returns_configs_for_user_groups(self):
        self.client.login(username="tester", password="pass123")
        response = self.client.get(reverse('container-configs'))
        self.assertEqual(response.status_code, 200)
        names = [cfg['name'] for cfg in response.json()]
        self.assertEqual(names, ["Public", "Admin Only"])

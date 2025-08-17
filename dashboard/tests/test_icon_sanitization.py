from django.test import TestCase
from django.contrib.auth.models import User

from dashboard.models import Container, ContainerConfig


class IconSanitizationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tester", password="pass123")

    def test_container_icon_sanitized(self):
        svg = '<svg onload="alert(1)"><script>alert(1)</script><rect width="10" height="10" onclick="doBad()" /></svg>'
        container = Container.objects.create(name="Test", icon=svg, owner=self.user)
        self.assertNotIn("script", container.icon)
        self.assertNotIn("onload", container.icon)
        self.assertNotIn("onclick", container.icon)
        self.assertIn("rect", container.icon)

    def test_container_config_icon_sanitized(self):
        svg = '<svg><rect width="10" height="10" /><script>alert(1)</script></svg>'
        cfg = ContainerConfig.objects.create(key="test", name="Test", icon=svg, route="/test")
        self.assertNotIn("script", cfg.icon)

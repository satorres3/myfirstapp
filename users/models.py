from django.db import models


class LoginPageSettings(models.Model):
    headline = models.CharField(max_length=255, blank=True)
    message = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to='login/', blank=True, null=True)

    def __str__(self):
        return "Login Page Settings"

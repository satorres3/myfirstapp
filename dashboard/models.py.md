from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferences = models.JSONField(default=dict)
    api_quota = models.PositiveIntegerField(default=1000)

    def __str__(self):
        return self.user.username

class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name='owned_departments', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='departments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    custom_fields_schema = models.JSONField(default=dict)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

class AIProviderSettings(models.Model):
    provider_name = models.CharField(max_length=50, unique=True) # e.g., 'google', 'openai'
    api_key = models.CharField(max_length=255)
    api_endpoint = models.URLField(blank=True)
    default_model = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.provider_name

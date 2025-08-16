from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    preferences = models.JSONField(default=dict)
    api_quota = models.PositiveIntegerField(default=1000)
    # Changed to TextField to support long base64 data URLs for avatars
    avatar_url = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.user.username

class Container(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.TextField(default='<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>')
    quickQuestions = models.JSONField(default=list)
    availableModels = models.JSONField(default=list)
    availablePersonas = models.JSONField(default=list)
    selectedModel = models.CharField(max_length=100, default='gemini-2.5-flash')
    selectedPersona = models.CharField(max_length=100, default='Helpful Assistant')
    functions = models.JSONField(default=list)
    accessControl = models.JSONField(default=list)
    owner = models.ForeignKey(User, related_name='owned_containers', on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='containers', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
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


class SiteBranding(models.Model):
    logo = models.ImageField(upload_to='branding/', blank=True, null=True)

    def __str__(self):
        return "Site Branding"


class ContainerConfig(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    icon = models.TextField(blank=True, null=True)
    route = models.CharField(max_length=200)
    allowed_roles = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name

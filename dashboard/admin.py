from django.contrib import admin
from .models import UserProfile, Container, AIProviderSettings, SiteBranding

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'api_quota')

@admin.register(Container)
class ContainerAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    list_filter = ('owner',)
    search_fields = ('name', 'description')
    filter_horizontal = ('members',)

@admin.register(AIProviderSettings)
class AIProviderSettingsAdmin(admin.ModelAdmin):
    list_display = ('provider_name', 'default_model', 'is_active')
    list_filter = ('is_active',)


@admin.register(SiteBranding)
class SiteBrandingAdmin(admin.ModelAdmin):
    list_display = ('logo',)

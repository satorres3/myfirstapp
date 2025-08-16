from django.contrib import admin
from .models import LoginPageSettings


@admin.register(LoginPageSettings)
class LoginPageSettingsAdmin(admin.ModelAdmin):
    list_display = ("headline",)

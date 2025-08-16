from django.urls import path
from .views import hub_view, settings_view

urlpatterns = [
    path('', hub_view, name='hub'),
    path('settings/', settings_view, name='settings'),
]

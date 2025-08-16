from django.urls import path
from .views import hub_view, settings_view, settings_detail_view, container_view, containers_list_view

app_name = 'dashboard'

urlpatterns = [
    path('', hub_view, name='hub'),
    path('settings/', settings_view, name='settings'),
    path('settings/<int:container_id>/', settings_detail_view, name='settings_detail'),
    path('containers/', containers_list_view, name='containers_list'),
    path('containers/<int:container_id>/', container_view, name='container'),
]

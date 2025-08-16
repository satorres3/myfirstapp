
from django.urls import path
from .views import portal_view

urlpatterns = [
    path('', portal_view, name='hub'), # 'hub' name is kept for LOGIN_REDIRECT_URL
]

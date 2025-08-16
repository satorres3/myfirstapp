from django.urls import path
from .views import CustomLoginView, microsoft_login, microsoft_callback, custom_logout

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', custom_logout, name='logout'),
    path('microsoft/login/', microsoft_login, name='microsoft_login'),
    path('microsoft/callback/', microsoft_callback, name='microsoft_callback'),
]



from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ContainerViewSet, CurrentUserView

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('', include(router.urls)),
]



from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import DepartmentViewSet, CurrentUserView

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('', include(router.urls)),
]

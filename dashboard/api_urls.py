

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ContainerViewSet, CurrentUserView, ContainerConfigView, TaskStatusView

router = DefaultRouter()
router.register(r'containers', ContainerViewSet, basename='container')

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('container-configs/', ContainerConfigView.as_view(), name='container-configs'),
    path('tasks/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('', include(router.urls)),
]

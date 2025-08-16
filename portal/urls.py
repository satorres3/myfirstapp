from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('dashboard.urls', namespace='dashboard')),
    path('accounts/', include('users.urls')),
    path('api/', include('dashboard.api_urls')),
]

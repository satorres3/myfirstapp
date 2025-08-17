from django.http import HttpRequest, HttpResponse
from django.shortcuts import render, redirect

from .ai import generate_greeting
from .models import Container


def hub_view(request: HttpRequest) -> HttpResponse:
    """Render the hub page for the authenticated user."""
    if not request.user.is_authenticated:
        return redirect('login')
    name = request.user.first_name or request.user.username
    greeting = generate_greeting(name)
    context = {"greeting": greeting}
    return render(request, 'dashboard/hub.html', context)


def settings_view(request: HttpRequest) -> HttpResponse:
    """Render the settings page."""
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/settings.html')


def settings_detail_view(request: HttpRequest, container_id: int) -> HttpResponse:
    """Render the settings detail page for a specific container."""
    if not request.user.is_authenticated:
        return redirect('login')
    context = {"container_id": container_id}
    return render(request, 'dashboard/settings_detail.html', context)


def container_view(request: HttpRequest, container_id: int) -> HttpResponse:
    """Render the container chat page."""
    if not request.user.is_authenticated:
        return redirect('login')
    context = {"container_id": container_id}
    return render(request, 'dashboard/container.html', context)


def containers_list_view(request: HttpRequest) -> HttpResponse:
    """Render a list of available containers."""
    if not request.user.is_authenticated:
        return redirect('login')
    containers = Container.objects.all()
    context = {"containers": containers}
    return render(request, 'dashboard/containers_list.html', context)

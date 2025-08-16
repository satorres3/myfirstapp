from django.shortcuts import render, redirect

from .models import Container

def hub_view(request):
    """Render the hub page."""
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/hub.html')


def settings_view(request):
    """Render the settings page."""
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard/settings.html')


def settings_detail_view(request, container_id):
    """Render the settings detail page for a container."""
    if not request.user.is_authenticated:
        return redirect('login')
    context = {"container_id": container_id}
    return render(request, 'dashboard/settings_detail.html', context)


def container_view(request, container_id):
    """Render the container chat page."""
    if not request.user.is_authenticated:
        return redirect('login')
    context = {"container_id": container_id}
    return render(request, 'dashboard/container.html', context)


def containers_list_view(request):
    """Render a list of available containers."""
    if not request.user.is_authenticated:
        return redirect('login')
    containers = Container.objects.all()
    context = {"containers": containers}
    return render(request, 'dashboard/containers_list.html', context)

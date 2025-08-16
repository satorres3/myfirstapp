from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def hub_view(request):
    """Render the hub page."""
    return render(request, 'dashboard/hub.html')


@login_required
def settings_view(request):
    """Render the settings page."""
    return render(request, 'dashboard/settings.html')


@login_required
def settings_detail_view(request, container_id):
    """Render the settings detail page for a container."""
    context = {"container_id": container_id}
    return render(request, 'dashboard/settings_detail.html', context)


@login_required
def container_view(request, container_id):
    """Render the container chat page."""
    context = {"container_id": container_id}
    return render(request, 'dashboard/container.html', context)


from django.shortcuts import render
from django.contrib.auth.decorators import login_required

@login_required
def portal_view(request):
    """
    Renders the main single-page application (SPA) shell.
    All frontend logic is handled by portal.js.
    """
    return render(request, 'dashboard/portal.html')

from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import Department

@login_required
def hub_view(request):
    """
    Displays the main dashboard hub.
    """
    departments = Department.objects.filter(members=request.user).order_by('-created_at')
    
    featured_department = departments.first()
    other_departments = departments[1:3] # Get next two for the side column

    context = {
        'featured_department': featured_department,
        'other_departments': other_departments,
    }
    return render(request, 'dashboard/hub.html', context)

@login_required
def settings_view(request):
    """
    Displays the settings page for managing departments and other configurations.
    """
    # In a real app, you would add forms for creation/editing.
    # For now, just list the departments the user is a member of.
    departments = Department.objects.filter(members=request.user).order_by('name')
    context = {
        'departments': departments,
    }
    return render(request, 'dashboard/settings.html', context)

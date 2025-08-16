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

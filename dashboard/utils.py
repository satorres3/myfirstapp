from .models import UserProfile


def decrement_api_quota(user):
    try:
        profile = UserProfile.objects.get(user=user)
    except UserProfile.DoesNotExist:
        return
    if profile.api_quota > 0:
        profile.api_quota -= 1
        profile.save()

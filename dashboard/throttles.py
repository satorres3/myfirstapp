from rest_framework.throttling import BaseThrottle
from .models import UserProfile


class UserProfileQuotaThrottle(BaseThrottle):
    """Throttle that blocks requests when a user's API quota is exhausted."""

    def allow_request(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return True
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return True
        return profile.api_quota > 0

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

class EmailOrUsernameBackend(BaseBackend):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    Allows login with either username or email.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        try:
            # Try to fetch the user by username
            user = UserModel.objects.get(username=username)
        except UserModel.DoesNotExist:
            try:
                # Try to fetch the user by email (case-insensitive)
                user = UserModel.objects.get(email__iexact=username)
            except UserModel.DoesNotExist:
                # Neither username nor email matched
                return None

        if user.check_password(password):
            return user
        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None

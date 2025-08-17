from typing import Any, Optional

from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import AbstractBaseUser
from django.db.models import Q
from django.http import HttpRequest

class EmailOrUsernameBackend(BaseBackend):
    """
    Authenticates against settings.AUTH_USER_MODEL.
    Allows login with either username or email.
    """

    def authenticate(
        self,
        request: HttpRequest | None,
        username: str | None = None,
        password: str | None = None,
        **kwargs: Any,
    ) -> Optional[AbstractBaseUser]:
        """Authenticate a user by matching the username or email and checking the password."""
        UserModel = get_user_model()
        user = UserModel.objects.filter(
            Q(username__iexact=username) | Q(email__iexact=username)
        ).first()

        if user and user.check_password(password):
            return user
        return None

    def get_user(self, user_id: int) -> Optional[AbstractBaseUser]:
        """Retrieve a user instance by its primary key."""
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None

from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.models import User
from dashboard.models import UserProfile
from .models import LoginPageSettings
import msal
import requests
import uuid
import base64
import logging

logger = logging.getLogger(__name__)

class CustomLoginView(LoginView):
    template_name = 'users/login.html'

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('hub')
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["login_settings"] = LoginPageSettings.objects.first()
        return context

def _build_msal_app(cache=None):
    return msal.ConfidentialClientApplication(
        settings.MS_CLIENT_ID,
        authority=settings.MS_AUTHORITY,
        client_credential=settings.MS_CLIENT_SECRET,
        token_cache=cache
    )

def _build_auth_url(request):
    request.session['state'] = str(uuid.uuid4())
    auth_url = _build_msal_app().get_authorization_request_url(
        settings.MS_SCOPE,
        state=request.session['state'],
        redirect_uri=request.build_absolute_uri(settings.MS_REDIRECT_PATH)
    )
    return auth_url

def microsoft_login(request):
    auth_url = _build_auth_url(request)
    return redirect(auth_url)

def microsoft_callback(request):
    if request.GET.get('state') != request.session.get('state'):
        return redirect('login')
    
    if "error" in request.GET:
        return render(request, 'users/login.html', {'error': request.GET['error_description'] or request.GET['error']})

    cache = msal.SerializableTokenCache()
    if request.session.get('token_cache'):
        cache.deserialize(request.session['token_cache'])

    app = _build_msal_app(cache=cache)
    
    try:
        result = app.acquire_token_by_authorization_code(
            request.GET.get('code'),
            scopes=settings.MS_SCOPE,
            redirect_uri=request.build_absolute_uri(settings.MS_REDIRECT_PATH)
        )
        
        if "error" in result:
            return render(request, 'users/login.html', {'error': result.get('error_description')})

        # Fetch user info from Microsoft Graph
        auth_header = {'Authorization': 'Bearer ' + result['access_token']}
        graph_data = requests.get(settings.MS_ENDPOINT, headers=auth_header).json()

        # Get or create user
        user, created = User.objects.get_or_create(
            username=graph_data['userPrincipalName'],
            defaults={
                'email': graph_data.get('mail', graph_data['userPrincipalName']),
                'first_name': graph_data.get('givenName'),
                'last_name': graph_data.get('surname'),
            }
        )
        
        # Get or create user profile
        user_profile, _ = UserProfile.objects.get_or_create(user=user)

        # Fetch and store profile picture as a data URL
        photo_response = requests.get(settings.MS_ENDPOINT + '/photo/$value', headers=auth_header)
        if photo_response.status_code == 200:
            content_type = photo_response.headers['Content-Type']
            photo_data = base64.b64encode(photo_response.content).decode('utf-8')
            user_profile.avatar_url = f"data:{content_type};base64,{photo_data}"
            user_profile.save()

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        # Save token cache in session
        request.session['token_cache'] = cache.serialize()
        request.session['user'] = graph_data

    except Exception as e:
        logger.exception("Microsoft authentication callback failed")
        return render(request, 'users/login.html', {'error': 'An error occurred during Microsoft sign-in. Please try again or contact support.'})

    return redirect('hub')


def custom_logout(request):
    logout(request)
    # Redirect to Microsoft's logout URL
    authority = settings.MS_AUTHORITY or ''
    # Only redirect to MS logout if authority is configured
    if 'login.microsoftonline.com' in authority:
        return redirect(
            authority + "/oauth2/v2.0/logout" +
            "?post_logout_redirect_uri=" + request.build_absolute_uri(reverse('login'))
        )
    return redirect('login')
from django.contrib.auth.views import LoginView
from django.shortcuts import redirect, render
from django.contrib.auth import login, logout
from django.urls import reverse
from django.conf import settings
from django.contrib.auth.models import User
import msal
import requests
import uuid

class CustomLoginView(LoginView):
    template_name = 'users/login.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('hub')
        return super().dispatch(request, *args, **kwargs)

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
        return render(request, 'users/login.html', {'error': request.GET['error']})

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
        graph_data = requests.get(
            settings.MS_ENDPOINT,
            headers={'Authorization': 'Bearer ' + result['access_token']}
        ).json()

        # Get or create user
        user, created = User.objects.get_or_create(
            username=graph_data['userPrincipalName'],
            defaults={
                'email': graph_data['mail'],
                'first_name': graph_data['givenName'],
                'last_name': graph_data['surname'],
            }
        )

        login(request, user, backend='django.contrib.auth.backends.ModelBackend')
        
        # Save token cache in session
        request.session['token_cache'] = cache.serialize()
        request.session['user'] = graph_data

    except Exception as e:
        return render(request, 'users/login.html', {'error': str(e)})

    return redirect('hub')


def custom_logout(request):
    logout(request)
    # Redirect to Microsoft's logout URL
    authority = settings.MS_AUTHORITY
    return redirect(
        authority + "/oauth2/v2.0/logout" +
        "?post_logout_redirect_uri=" + request.build_absolute_uri(reverse('login'))
    )

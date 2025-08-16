

# Django Settings
DEBUG=True
# Generate a new secret key for production. You can use: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
SECRET_KEY='django-insecure-example-key-for-local-dev'
ALLOWED_HOSTS=127.0.0.1,localhost

# Database URL
# The default is set to connect to the PostgreSQL container from docker-compose.
DATABASE_URL=postgres://user:password@db:5432/ai_portal

# --- ALTERNATIVE (for non-docker, local dev) ---
# DATABASE_URL=sqlite:///db.sqlite3


# Redis URL for Caching and Channels
REDIS_URL=redis://redis:6379/1

# AI Provider API Keys (add your keys here)
GOOGLE_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GROQ_API_KEY=

# Microsoft Entra ID (Azure AD) Authentication
MS_CLIENT_ID=
MS_CLIENT_SECRET=
MS_AUTHORITY=https://login.microsoftonline.com/common

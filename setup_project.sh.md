#!/bin/bash
# This script restores the correct file extensions for the project.
echo "Setting up project structure..."

# Function to safely move files
move_file() {
  if [ -f "$1" ]; then
    mv "$1" "$2"
    echo "Renamed $1 to $2"
  else
    # This is not an error, the script may have run before.
    echo "Skipping $1 (already renamed or does not exist)."
  fi
}

# Rename all files
move_file "manage.py.md" "manage.py"
move_file "portal/__init__.py.md" "portal/__init__.py"
move_file "portal/settings.py.md" "portal/settings.py"
move_file "portal/urls.py.md" "portal/urls.py"
move_file "portal/wsgi.py.md" "portal/wsgi.py"
move_file "portal/asgi.py.md" "portal/asgi.py"
move_file "users/apps.py.md" "users/apps.py"
move_file "users/views.py.md" "users/views.py"
move_file "users/urls.py.md" "users/urls.py"
move_file "users/backends.py.md" "users/backends.py"
move_file "dashboard/apps.py.md" "dashboard/apps.py"
move_file "dashboard/models.py.md" "dashboard/models.py"
move_file "dashboard/views.py.md" "dashboard/views.py"
move_file "dashboard/urls.py.md" "dashboard/urls.py"
move_file "dashboard/admin.py.md" "dashboard/admin.py"
move_file "dashboard/serializers.py.md" "dashboard/serializers.py"
move_file "dashboard/api_urls.py.md" "dashboard/api_urls.py"
move_file "dashboard/api_views.py.md" "dashboard/api_views.py"
move_file "dashboard/management/__init__.py.md" "dashboard/management/__init__.py"
move_file "dashboard/management/commands/__init__.py.md" "dashboard/management/commands/__init__.py"
move_file "dashboard/management/commands/seed_data.py.md" "dashboard/management/commands/seed_data.py"

# Migrations
# CRITICAL: Clean up old migrations to ensure a clean slate for auto-generation.
echo "Cleaning up old migration files..."
rm -rf dashboard/migrations
mkdir -p dashboard/migrations
touch dashboard/migrations/__init__.py
echo "Created clean migrations directory."


move_file "docs/conf.py.md" "docs/conf.py"
move_file "docs/index.rst.md" "docs/index.rst"
move_file "gitignore.md" ".gitignore"
move_file "Dockerfile.md" "Dockerfile"
move_file "docker-compose.yml.md" "docker-compose.yml"
move_file "Makefile.md" "Makefile"
move_file "env.example.md" ".env.example"

echo "Cleaning up obsolete files..."
# These files were from the old SPA-only structure and are no longer needed.
rm -f index.html index.css index.tsx login.html login.tsx
rm -f templates/dashboard/hub.html templates/dashboard/settings.html
rm -rf theme tailwind.config.js tailwind.config.js.md

echo "Project setup complete! You can now follow the instructions in README.md."

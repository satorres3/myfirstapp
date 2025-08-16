
#!/bin/bash
# This script restores the correct file extensions for the project.
# Run this script once after extracting the files.
echo "Setting up project structure..."

# Function to safely move files
move_file() {
  if [ -f "$1" ]; then
    mv "$1" "$2"
    echo "Renamed $1 to $2"
  else
    echo "Warning: $1 not found."
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
move_file "docs/conf.py.md" "docs/conf.py"
move_file "docs/index.rst.md" "docs/index.rst"
move_file "gitignore.md" ".gitignore"
move_file "Dockerfile.md" "Dockerfile"
move_file "docker-compose.yml.md" "docker-compose.yml"
move_file "Makefile.md" "Makefile"
move_file "env.example.md" ".env.example"

# The lines for theme/apps.py.md and tailwind.config.js.md have been removed
# as those files are obsolete.

echo "Project setup complete! You can now follow the instructions in README.md."

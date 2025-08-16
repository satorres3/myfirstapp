
# AI Department Portal

A comprehensive, GitHub-ready web portal for managing departments and interacting with configurable AI agents. Built with Python/Django, this portal features a robust backend, a modern and responsive UI, and a scalable architecture ready for production deployment.

## Core Features

- **Secure Authentication**: Built-in Django authentication with a sleek UI, easily extendable for Microsoft & Google OAuth.
- **Modern Dashboard**: A responsive hub page inspired by the Microsoft Azure Blog layout for managing departments.
- **Dynamic Department Cards**: Customizable, interactive cards for each department.
- **Integrated AI Assistant**: Centralized and per-department AI chat capabilities (architecture-ready).
- **Extensive Configuration**: A settings-driven architecture to manage AI providers, UI themes, and department features dynamically.
- **Production Ready**: Includes full Docker support, CI/CD readiness, and comprehensive documentation.

## Tech Stack

- **Backend**: Python 3.12+, Django 5.0+, Django REST Framework, Django Channels (for WebSockets)
- **Frontend**: HTML5, Tailwind CSS, JavaScript
- **Database**: PostgreSQL (production), SQLite (development)
- **AI/ML**: LangChain, Sentence-Transformers, FAISS (for local vector stores)
- **Caching/Broker**: Redis
- **Deployment**: Docker, Gunicorn

---

## Getting Started

### Prerequisites

- Python 3.10+
- Docker and Docker Compose
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ai-department-portal
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root by copying the example file:

```bash
cp .env.example .env
```

Now, edit the `.env` file. For local development, the default settings are usually sufficient.
```env
# .env
DEBUG=True
SECRET_KEY='your-super-secret-key-for-local-dev' # Change this
DATABASE_URL='sqlite:///db.sqlite3'
REDIS_URL='redis://localhost:6379/1'
# Add AI Provider API keys here
# OPENAI_API_KEY=
# GOOGLE_API_KEY=
```

### 3. Build and Run with Docker Compose

This is the recommended way to run the application locally. It will set up the Django web server, PostgreSQL database, and Redis instance.

```bash
docker-compose up --build
```

The application will be available at `http://localhost:8000`.

### 4. Apply Database Migrations and Create a Superuser

In a new terminal, while the containers are running, execute the following commands:

```bash
# Apply database migrations
docker-compose exec web python manage.py migrate

# Create an admin user for the Django admin panel
docker-compose exec web python manage.py createsuperuser
```

You can now access the Django admin panel at `http://localhost:8000/admin`.

---

## Usage Guide

1.  **Login**: Access the application at `http://localhost:8000`. You will be redirected to the login page. Use the superuser credentials you created.
2.  **Dashboard Hub**: After logging in, you'll see the main dashboard. From here, you can view existing departments.
3.  **Create Departments**: Use the Django Admin (`/admin`) to create and manage departments, users, and AI provider settings. These will then appear on the dashboard.
4.  **Configure AI**: Navigate to the "AI Provider Settings" section in the admin panel to add API keys and select default models for the AI assistants.

## Documentation

This project uses Sphinx for automatic documentation generation from code docstrings.

To build the documentation:

```bash
# First, install dependencies locally if you haven't
# python -m venv venv && source venv/bin/activate
# pip install -r requirements.txt

# Build the docs
make docs
```
The HTML documentation will be available in the `docs/_build/html` directory.

## Deployment

This application is designed for containerized deployment. You can use the provided `Dockerfile` to build an image and deploy it to services like Azure App Service, Azure Kubernetes Service (AKS), or any other container hosting platform.

Ensure your production environment variables (like `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`) are securely configured.

---

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards (e.g., run `black .` and `flake8 .`).

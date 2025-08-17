

# AI Container Portal

[![Tests](https://github.com/OWNER/REPO/actions/workflows/tests.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/tests.yml)

A comprehensive, GitHub-ready web portal for managing containers and interacting with configurable AI agents. Built with Python/Django, this portal features a robust backend, a modern and responsive UI, and a scalable architecture ready for production deployment.

For a deeper look at the system design, see the [Architecture Overview](architecture.md).

---

## ⚠️ One-Time Project Initialization (Required First Step)

Due to a generation constraint, project files that should end in `.py`, `.sh`, `.yml`, etc., have been created with a `.md` extension. You **must** run the included setup script **once** to restore the correct file names before proceeding.

### Instructions

1.  **Rename the Setup Script:**
    Open your terminal or command prompt in the project's root directory and run:
    ```bash
    mv setup_project.sh.md setup_project.sh
    ```

2.  **Make the Script Executable:**
    (This step is usually required on Linux and macOS)
    ```bash
    chmod +x setup_project.sh
    ```

3.  **Run the Script:**
    ```bash
    ./setup_project.sh
    ```

> **Note for Windows Users:** You can run the commands above using [Git Bash](https://git-scm.com/downloads) (which comes with Git for Windows) or any other Unix-like terminal environment like WSL.

After the script finishes, all files will have their correct extensions, and you can proceed with the standard setup instructions below.

---

## Getting Started

This guide provides the simplest way to get the application running locally using Docker.

### Prerequisites

-   **Git**: To clone the repository. You can download it from [git-scm.com](https://git-scm.com/downloads).
-   **Docker and Docker Compose**: This is the recommended way to run the application locally. It manages the database, web server, and all dependencies in isolated containers.

#### Docker Installation

The most reliable way to install Docker is by following the official guides on the Docker website, as the instructions are tailored to your specific operating system.

-   **Official Docker Website:** [**https://docs.docker.com/get-docker/**](https://docs.docker.com/get-docker/)

-   **For Windows and macOS:** Download **Docker Desktop**. It includes Docker Engine, Docker CLI, and Docker Compose in a single, easy-to-install application.
-   **For Linux:** Follow the instructions for your specific distribution (e.g., Ubuntu, Fedora, CentOS). After installing the Docker Engine, you may also need to install the Docker Compose plugin separately. The official documentation covers this process.

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd <repository-folder-name>
```

### Step 2: Create Your Environment File

Copy the example environment file. The default settings are now configured for the PostgreSQL Docker setup and will work out of the box.

```bash
cp .env.example .env
```
You will need to edit this file to add your API keys for AI providers and Microsoft Entra ID.

#### Key Environment Variables

The application is configured via a `.env` file. Important settings include:

| Variable | Description |
| --- | --- |
| `SECRET_KEY` | Django secret key used for cryptographic signing. Set to a long random string in production. |
| `DATABASE_URL` | Connection string for the database. Defaults to the PostgreSQL container; can be switched to SQLite for local development. |
| `REDIS_URL` | Redis connection used for caching and Channels. |
| `GOOGLE_API_KEY` | Required API key for Gemini models. |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GROQ_API_KEY` | Optional API keys for additional AI providers. |
| `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_AUTHORITY` | Microsoft Entra ID credentials for OAuth login. |

See `.env.example` for a full list of available variables.

### Step 3: Build and Run the Application

Use Docker Compose to build the container images and start the application.

```bash
docker-compose up --build
```

After the containers start, apply the database migrations:

```bash
docker-compose exec web python manage.py makemigrations dashboard
docker-compose exec web python manage.py migrate
```

You can run all of the above steps at once using the Makefile:

```bash
make start
```

Once migrations finish, the application will be running at **http://localhost:8080**.

### Common Docker Commands

| Command | Description |
| --- | --- |
| `docker-compose up --build` | Build images and start the stack. |
| `docker-compose down -v` | Stop containers and remove volumes (destroys database). |
| `docker-compose exec web python manage.py migrate` | Run database migrations inside the web container. |
| `docker-compose exec web pytest` | Run the test suite inside the container. |

### Local Development Without Docker

For lightweight local development you can run the server directly without Docker. Ensure Python 3.12+ and Node.js are installed, then:

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
SECRET_KEY=test DATABASE_URL=sqlite:///db.sqlite3 REDIS_URL=redis://localhost:6379/0 python manage.py migrate
SECRET_KEY=test DATABASE_URL=sqlite:///db.sqlite3 REDIS_URL=redis://localhost:6379/0 python manage.py runserver
```

In a separate terminal start the frontend dev server:

```bash
npm run dev
```

### Running Tests

Run the project's tests to verify changes:

```bash
docker-compose exec web pytest
```

For non-Docker development:

```bash
SECRET_KEY=test DATABASE_URL=sqlite:///db.sqlite3 REDIS_URL=redis://localhost:6379/0 python manage.py test
```

### Step 4: Log In!

The setup is complete! You can now log in to the application using one of the default accounts or your Microsoft account.

#### Default Accounts

-   **Administrator:**
    -   **Username:** `admin`
    -   **Password:** `admin`
-   **Demo User:**
    -   **Username:** `demo`
    -   **Password:** `demo`

You can also access the Django admin panel at `http://localhost:8080/admin` using the `admin` account.

### Step 5: Explore the Dashboard

After logging in you will land on the dashboard hub. Each major section now has its own URL so pages can be refreshed or bookmarked directly:

- **Hub:** `http://localhost:8080/`
- **Settings overview:** `http://localhost:8080/settings/`
- **Settings detail:** `http://localhost:8080/settings/<container_id>/`
- **Container view:** `http://localhost:8080/containers/<container_id>/`

Use the navigation links in the UI or visit the URLs above to move between sections.

### Step 5: Explore the Dashboard

After logging in you will land on the dashboard hub. Each major section now has its own URL so pages can be refreshed or bookmarked directly:

- **Hub:** `http://localhost:8000/`
- **Settings overview:** `http://localhost:8000/settings/`
- **Settings detail:** `http://localhost:8000/settings/<container_id>/`
- **Container view:** `http://localhost:8000/containers/<container_id>/`

Use the navigation links in the UI or visit the URLs above to move between sections.

### Container Catalog and `ContainerConfig`

The dashboard hub loads its navigation dynamically from the `ContainerConfig` model. Each
configuration entry defines a `key`, human-readable `name`, optional SVG `icon`, target
`route`, and `allowed_roles`. When the hub page loads it calls the
`/api/container-configs/` endpoint, which returns only the configurations the current user
is permitted to view. The returned list is rendered as the grid of cards that make up the
container catalog. New configurations can be added through the Django admin interface or
via the `seed_data` management command.

### Container Workspaces

Each container now renders inside a shared workspace layout with a keyboard-friendly sidebar and a docked AI assistant. Plugins live under `src/plugins/*` and are loaded on demand when selected.

---
## Microsoft Entra ID (Azure AD) Authentication Setup

To enable "Sign in with Microsoft," you need to register an application in the Microsoft Azure portal.

1.  **Navigate to App Registrations:**
    -   Sign in to the [Azure Portal](https://portal.azure.com).
    -   Go to **Microsoft Entra ID** > **App registrations**.
    -   Click **+ New registration**.

2.  **Register the Application:**
    -   **Name:** Give your application a descriptive name (e.g., `AI Portal Local Dev`).
    -   **Supported account types:** Choose `Accounts in this organizational directory only (Single tenant)` for internal use, or `Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant)` for broader access.
    -   **Redirect URI:**
        -   Select **Web** from the dropdown.
        -   Enter `http://localhost:8080/accounts/microsoft/callback/`
    -   Click **Register**.

3.  **Configure Environment Variables:**
    -   On your application's **Overview** page in Azure, copy the **Application (client) ID** and paste it into the `MS_CLIENT_ID` variable in your `.env` file.
    -   The `MS_AUTHORITY` URL is typically `https://login.microsoftonline.com/{your-tenant-id}`. You can find your **Directory (tenant) ID** on the same overview page. For multitenant apps, you can often use `https://login.microsoftonline.com/common`.

4.  **Create a Client Secret:**
    -   Go to **Certificates & secrets** > **Client secrets**.
    -   Click **+ New client secret**.
    -   Add a description and set an expiration period.
    -   **IMPORTANT:** Copy the secret **Value** immediately after creation. You will not be able to see it again. Paste this value into the `MS_CLIENT_SECRET` variable in your `.env` file.

5.  **Add API Permissions:**
    -   Go to **API permissions**.
    -   Click **+ Add a permission** > **Microsoft Graph**.
    -   Select **Delegated permissions**.
    -   Search for and add `User.Read`. This allows the application to read the signed-in user's profile.
    -   Search for and add `User.ReadBasic.All`. This allows fetching profile pictures.
    -   Click **Add permissions**.
    -   You may need to click the **Grant admin consent for [Your Tenant]** button.

After configuring your `.env` file, restart the application with `docker-compose up --build` for the changes to take effect.


---

## Troubleshooting

### How to do a Full Reset (Fixes most database errors)

> **IMPORTANT:** After pulling new changes from version control that include modifications to the database models (`models.py`), you **must** perform a full reset to ensure your local database schema is updated correctly.

If you encounter persistent database errors (like "column does not exist" or "relation does not exist"), the most reliable solution is to completely reset the Docker environment. This will delete the old database and rebuild everything from scratch.

1.  **Stop and Remove Everything:**
    This command stops all containers and **deletes the database volume**, effectively erasing the old database.
    ```bash
    docker-compose down -v
    ```

2.  **Rebuild and Start:**
    This will build a new Docker image, create a fresh database, and run the automated setup and migration process again.
    ```bash
    docker-compose up --build
    ```

### `ModuleNotFoundError: No module named 'users.backends'`

If you encounter this error, it means the Docker container was built with an incorrectly named file. To fix this, follow these steps:

1.  **Stop the running containers:** `docker-compose down`
2.  **Run the setup script again** to ensure all files have the correct names: `./setup_project.sh`
3.  **Rebuild the Docker image and restart:** `docker-compose up --build`

This will force Docker to copy the correctly named files into the container.
    
---

## Core Features

- **Secure Authentication**: Built-in Django authentication with a sleek UI.
- **Simple & Modern UI**: A clean user interface for the login page and dashboard.
- **Production Ready**: Includes full Docker support for containerized deployment.
- **Extensible Backend**: A solid Django foundation ready for you to build upon.

## Tech Stack

- **Backend**: Python 3.12+, Django 5.0+
- **Frontend**: HTML5, CSS3, JavaScript (via Django Templates)
- **Database**: PostgreSQL (production), SQLite (optional for non-Docker dev)
- **Deployment**: Docker, Gunicorn

## Logging

Application logs are stored in `logs/portal.log` relative to the project root. Logs are formatted as JSON and rotated nightly, retaining seven days of history.

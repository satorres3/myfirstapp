
# AI Department Portal

A comprehensive, GitHub-ready web portal for managing departments and interacting with configurable AI agents. Built with Python/Django, this portal features a robust backend, a modern and responsive UI, and a scalable architecture ready for production deployment.

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

Copy the example environment file. The default settings are configured for the Docker setup and will work out of the box.

```bash
cp .env.example .env
```
You only need to edit this file later if you want to add API keys for AI providers.

### Step 3: Build and Run the Application

Use Docker Compose to build the container images and start the application.

```bash
docker-compose up --build
```
The application will now be running at **http://localhost:8000**.

### Step 4: Set Up the Database

With the containers running, open a **new terminal window** and run the database migrations. This command creates the necessary tables in the database.

```bash
docker-compose exec web python manage.py migrate
```

### Step 5: Create a User Account

Now that the database is set up, run the following command to create a superuser account. You will use this to log in.

```bash
docker-compose exec web python manage.py createsuperuser
```

Follow the prompts to create your username and password. You can now log in to the application and access the Django admin panel at `http://localhost:8000/admin`.

---

## Troubleshooting

### `ModuleNotFoundError: No module named 'users.backends'`

If you encounter this error after running `docker-compose up`, it means the project was started before the `setup_project.sh` script was updated to include the new `users/backends.py` file. The Docker container was built with the incorrectly named `.md` file.

To fix this, follow these steps:

1.  **Stop the running containers:**
    ```bash
    docker-compose down
    ```

2.  **Ensure the setup script is up-to-date** and run it again. This will ensure `users/backends.py.md` is correctly renamed to `users/backends.py`.
    ```bash
    ./setup_project.sh
    ```

3.  **Rebuild the Docker image and restart the containers:**
    ```bash
    docker-compose up --build
    ```

This will force Docker to rebuild the `web` service's image, copying the correctly named files into the container and resolving the error.

---

## Core Features

- **Secure Authentication**: Built-in Django authentication with a sleek UI.
- **Simple & Modern UI**: A clean user interface for the login page and dashboard.
- **Production Ready**: Includes full Docker support for containerized deployment.
- **Extensible Backend**: A solid Django foundation ready for you to build upon.

## Tech Stack

- **Backend**: Python 3.12+, Django 5.0+
- **Frontend**: HTML5, CSS3, JavaScript
- **Database**: PostgreSQL (production), SQLite (development)
- **Deployment**: Docker, Gunicorn
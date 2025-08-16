

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

Copy the example environment file. The default settings are now configured for the PostgreSQL Docker setup and will work out of the box.

```bash
cp .env.example .env
```
You only need to edit this file later if you want to add API keys for AI providers.

### Step 3: Build and Run the Application

Use Docker Compose to build the container images and start the application.

```bash
docker-compose up --build
```
The application will now be running at **http://localhost:8000**. The startup command will automatically handle project setup and database migrations for you.

### Step 4: Log In!

The setup is complete! You can now log in to the application using one of the default accounts.

#### Default Accounts

-   **Administrator:**
    -   **Username:** `admin`
    -   **Password:** `admin`
-   **Demo User:**
    -   **Username:** `demo`
    -   **Password:** `demo`

You can also access the Django admin panel at `http://localhost:8000/admin` using the `admin` account.

---

## Troubleshooting

### How to do a Full Reset (Fixes most database errors)

If you encounter persistent database errors (like "column does not exist" or "no such table"), especially after changing models or migrations, the most reliable solution is to completely reset the Docker environment. This will delete the old database and rebuild everything from scratch.

1.  **Stop and Remove Everything:**
    This command stops the containers and **deletes the database volume**.
    ```bash
    docker-compose down -v
    ```

2.  **Rebuild and Start:**
    This will create a fresh database and run the setup and migration process again.
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
- **Frontend**: HTML5, CSS3 (via Django Templates)
- **Database**: PostgreSQL (production), SQLite (optional for non-Docker dev)
- **Deployment**: Docker, Gunicorn
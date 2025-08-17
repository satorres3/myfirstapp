# AI Agent Workflow for the AI Container Portal Project

This document defines the rules and commands for the AI agent to autonomously interact with this project.

---

## 1. Development Environment Configuration

* **Language**: Python 3.12+
* **Framework**: Django 5.0+
* **Execution**: Docker and Docker Compose
* **Initialization Command**: `docker-compose up --build`
    * **Note**: This command automatically handles database creation and migrations.

---

## 2. Essential Commands

### 2.1. Test Execution
The project uses `pytest`. The agent **must** run tests after every code change to ensure no regressions have been introduced.

For Docker:
* **Command**: `docker-compose exec web pytest`

For non-Docker development:
* **Command**: `SECRET_KEY=test DATABASE_URL=sqlite:///db.sqlite3 REDIS_URL=redis://localhost:6379/0 python manage.py test`

### 2.2. Environment Restart
For changes to take effect, restart the relevant environment.

* **Docker**: `docker-compose restart web`
* **Non-Docker**: restart the `manage.py runserver` and `npm run dev` processes

---

## 3. Automated Workflow

### 3.1. Bug Fix Rules
When a bug fix task is assigned, the agent should follow this sequence:

1.  Create a new branch from `main` with the pattern `fix/[short-description-of-bug]`.
2.  Implement the fix in the source code.
3.  Run the tests using the command `docker-compose exec web pytest`.
4.  If tests pass:
    * Create a commit with the message `Fix: [description of bug]`.
    * Create a **pull request** to the `main` branch.
5.  If tests fail:
    * Stop execution. The agent must analyze the test output and attempt to resolve the failure before proceeding.

### 3.2. New Feature Rules
When a new feature task is assigned, the agent should follow this sequence:

1.  Create a new branch from `main` with the pattern `feat/[name-of-feature]`.
2.  Implement the new functionality.
3.  Create appropriate new unit or integration tests in the `tests/` directory.
4.  Run all tests using the command `docker-compose exec web pytest`.
5.  If all tests (new and existing) pass:
    * Create a commit with the message `Feat: [description of feature]`.
    * Create a **pull request** to the `main` branch.
6.  If tests fail:
    * Stop execution and resolve the failures before continuing.

---

## 4. Best Practices

* **Commit Messages**: Use the `Feat:` prefix for new features and `Fix:` for bug fixes.
* **Pull Requests**: PRs should be reviewed and merged by a human developer. The agent **must not** merge automatically.
* **Documentation**: When applicable, the agent should update relevant documentation (e.g., `README.md` or `agents.md`) to reflect the changes.
# Makefile for common project tasks

.PHONY: docs start help lint

docs:
	@echo "Building Sphinx documentation..."
	@cd docs && make html
	@echo "Documentation built in docs/_build/html"

start:
	@echo "Building containers and applying migrations..."
	@docker-compose up --build -d
	@docker-compose exec web python manage.py makemigrations dashboard
	@docker-compose exec web python manage.py migrate

lint:
	black --check .
	flake8

help:
	@echo "Available commands:"
	@echo "  make docs    - Build the Sphinx documentation."
	@echo "  make start   - Build containers and run migrations."
	@echo "  make lint    - Run code style checks."

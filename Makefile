# Makefile for common project tasks

.PHONY: docs start help

docs:
	@echo "Building Sphinx documentation..."
	@cd docs && make html
	@echo "Documentation built in docs/_build/html"

start:
	@echo "Building containers and applying migrations..."
	@docker-compose up --build -d
	@docker-compose exec web python manage.py makemigrations dashboard
	@docker-compose exec web python manage.py migrate

help:
	@echo "Available commands:"
	@echo "  make docs    - Build the Sphinx documentation."
	@echo "  make start   - Build containers and run migrations."

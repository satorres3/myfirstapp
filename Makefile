# Makefile for common project tasks

.PHONY: docs

docs:
	@echo "Building Sphinx documentation..."
	@cd docs && make html
	@echo "Documentation built in docs/_build/html"

help:
	@echo "Available commands:"
	@echo "  make docs    - Build the Sphinx documentation."

.PHONY: help dev db-up db-down migrate migrate-create seed test lint format typecheck clean

PYTHON := backend/.venv/bin/python
UVICORN := backend/.venv/bin/uvicorn
ALEMBIC := backend/.venv/bin/alembic
PYTEST := backend/.venv/bin/pytest
RUFF := backend/.venv/bin/ruff
MYPY := backend/.venv/bin/mypy

help:
	@echo "GroundUp AI Backend Make targets:"
	@echo "  make dev            - Start database and run backend API locally"
	@echo "  make db-up          - Start postgres via docker-compose"
	@echo "  make db-down        - Stop postgres container"
	@echo "  make migrate        - Run alembic database migrations"
	@echo "  make migrate-create - Create a new revision (usage: make migrate-create msg='init')"
	@echo "  make seed           - Seed database with initial fixtures"
	@echo "  make test           - Run backend test suite"
	@echo "  make lint           - Run ruff linter check"
	@echo "  make format         - Format codebase with ruff"
	@echo "  make typecheck      - Run mypy type checker"

db-up:
	docker compose up -d db

db-down:
	docker compose down

dev: db-up
	PYTHONPATH=backend $(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	cd backend && PYTHONPATH=. ../$(ALEMBIC) upgrade head

migrate-create:
	cd backend && PYTHONPATH=. ../$(ALEMBIC) revision --autogenerate -m "$(msg)"

seed:
	PYTHONPATH=backend $(PYTHON) -m app.seed.seed_runner

test:
	PYTHONPATH=backend $(PYTEST) backend/tests -v

lint:
	$(RUFF) check backend

format:
	$(RUFF) format backend

typecheck:
	$(MYPY) --config-file backend/pyproject.toml backend/app

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .mypy_cache -exec rm -rf {} +
	find . -type d -name .ruff_cache -exec rm -rf {} +

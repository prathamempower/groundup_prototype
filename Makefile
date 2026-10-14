.PHONY: help dev build start test test-e2e lint typecheck clean

help:
	@echo "GroundUp AI (Standalone Frontend) Make targets:"
	@echo "  make dev       - Start Next.js frontend dev server"
	@echo "  make build     - Build production Next.js frontend"
	@echo "  make start     - Start production Next.js frontend server"
	@echo "  make test      - Run unit tests with vitest"
	@echo "  make test-e2e  - Run Playwright end-to-end tests"
	@echo "  make lint      - Run Next.js ESLint"
	@echo "  make typecheck - Run TypeScript type checking"
	@echo "  make clean     - Clean Next.js build cache and temporary files"

dev:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build

start:
	npm --prefix frontend run start

test:
	npm --prefix frontend run test

test-e2e:
	npm --prefix frontend run test:e2e

lint:
	npm --prefix frontend run lint

typecheck:
	npm --prefix frontend run type-check

clean:
	rm -rf frontend/.next frontend/.next-dev frontend/test-results
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

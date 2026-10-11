from fastapi import APIRouter

from app.api.v1 import (
    budgets,
    documents,
    draws,
    economics,
    health,
    identity,
    onboarding,
    progress,
    reporting,
    spend,
)

api_v1_router = APIRouter()

# Health router
api_v1_router.include_router(health.router, tags=["Health"])

# Identity router
api_v1_router.include_router(identity.router, tags=["Identity"])

# Projects & Onboarding router
api_v1_router.include_router(onboarding.router, tags=["Projects & Onboarding"])

# Documents router
api_v1_router.include_router(documents.router, tags=["Documents"])

# Budgets router
api_v1_router.include_router(budgets.router, tags=["Budgets"])

# Spend & Accounts router
api_v1_router.include_router(spend.router, tags=["Spend & Accounts"])

# Draws & Funding router
api_v1_router.include_router(draws.router, tags=["Draws & Funding"])

# Progress & Milestones router
api_v1_router.include_router(progress.router, tags=["Progress & Milestones"])

# Economics & Investors router
api_v1_router.include_router(economics.router, tags=["Economics & Investors"])

# Alerts, Reports & Audit router
api_v1_router.include_router(reporting.router, tags=["Alerts, Reports & Audit"])

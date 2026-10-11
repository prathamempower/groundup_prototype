# Granular permissions
PERMISSIONS: dict[str, set[str]] = {
    "OWNER": {
        "all",
        "organization:manage",
        "users:manage",
        "invitations:manage",
        "projects:create",
        "projects:manage",
        "budgets:approve",
        "change_orders:approve",
        "draws:manage",
        "reports:read",
        "investor_updates:publish",
        "audit:read",
    },
    "CFO": {
        "projects:read",
        "budgets:manage",
        "spend:manage",
        "reconciliation:manage",
        "draws:verify_cost",
        "draws:fund",
        "reports:read",
    },
    "PM": {
        "projects:read",
        "budgets:read",
        "progress:manage",
        "milestones:manage",
        "draws:verify_work",
        "inspections:manage",
        "reports:read",
    },
    "GC": {
        "projects:read_assigned",
        "submissions:manage",
        "milestones:claim",
        "change_orders:request",
    },
    "INVESTOR": {
        "investor:read_published",
    },
}


def get_role_permissions(role: str) -> list[str]:
    return sorted(PERMISSIONS.get(role.upper(), set()))

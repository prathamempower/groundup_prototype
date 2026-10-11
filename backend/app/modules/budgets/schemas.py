from pydantic import BaseModel, Field


class BudgetLineCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    original_amount: int = Field(ge=0)
    parent_line_code: str | None = None
    is_draw_eligible: bool = True
    sort_order: int = 0
    milestone_id: str | None = None


class BudgetCreate(BaseModel):
    lines: list[BudgetLineCreate]


class BudgetLineRead(BaseModel):
    id: str
    budget_id: str
    parent_line_id: str | None = None
    code: str
    name: str
    category: str
    original_amount: int
    current_approved_amount: int
    is_draw_eligible: bool
    milestone_id: str | None = None
    sort_order: int
    created_at: str


class BudgetRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    version_number: int
    status: str
    approved_by: str | None = None
    approved_at: str | None = None
    total_original_amount: int
    total_current_approved_amount: int
    version: int
    created_at: str
    lines: list[BudgetLineRead] = []


class BudgetLineCurrentView(BaseModel):
    id: str
    code: str
    name: str
    category: str
    parent_line_id: str | None = None
    original_amount: int
    current_approved_amount: int
    spend_amount: int
    committed_amount: int
    draw_requested_amount: int
    draw_approved_amount: int
    draw_funded_amount: int
    remaining_exposure: int
    is_overrun: bool
    is_draw_eligible: bool
    milestone_id: str | None = None


class CurrentBudgetResponse(BaseModel):
    budget_id: str
    version_number: int
    status: str
    total_original_amount: int
    total_current_approved_amount: int
    total_spend_amount: int
    total_committed_amount: int
    total_draw_requested_amount: int
    total_draw_approved_amount: int
    total_draw_funded_amount: int
    total_remaining_exposure: int
    has_overrun: bool
    lines: list[BudgetLineCurrentView]


class ChangeOrderLineCreate(BaseModel):
    budget_line_id: str
    amount: int
    description: str = Field(min_length=1)


class ChangeOrderCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    reason: str = Field(min_length=1)
    change_order_number: str | None = None
    lines: list[ChangeOrderLineCreate]


class ChangeOrderLineRead(BaseModel):
    id: str
    change_order_id: str
    budget_line_id: str
    amount: int
    description: str
    created_at: str


class ChangeOrderRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    change_order_number: str
    title: str
    reason: str
    status: str
    requested_amount: int
    approved_amount: int | None = None
    requested_by: str
    approved_by: str | None = None
    approved_at: str | None = None
    created_at: str
    lines: list[ChangeOrderLineRead] = []


class ChangeOrderRejectRequest(BaseModel):
    reason: str = Field(min_length=1)


class ContingencyMovementRequest(BaseModel):
    from_budget_line_id: str
    to_budget_line_id: str
    amount: int = Field(gt=0)
    reason: str = Field(min_length=1)


class ContingencyMovementRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    from_budget_line_id: str
    to_budget_line_id: str
    amount: int
    reason: str
    approved_by: str
    approved_at: str
    created_at: str


class LinkMilestoneRequest(BaseModel):
    milestone_id: str | None = None

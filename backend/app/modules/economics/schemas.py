from datetime import date

from pydantic import BaseModel, Field


# ---------------------------------------------------------
# Pro Forma & Financial Plans
# ---------------------------------------------------------
class ProFormaLineInput(BaseModel):
    category: str  # REVENUE, HARD_COST, SOFT_COST, FINANCING, SUMMARY
    line_name: str
    original_plan_amount: int = 0  # minor units (cents)
    current_forecast_amount: int = 0  # minor units (cents)
    actual_cleared_amount: int | None = None
    basis: str = "ESTIMATED"  # ACTUAL, COMMITTED, APPROVED, ESTIMATED, MISSING
    variance_rationale: str | None = None
    notes: str | None = None


class FinancialPlanCreate(BaseModel):
    plan_type: str = "PRO_FORMA"  # ORIGINAL, CURRENT_PRO_FORMA
    projected_revenue: int = Field(ge=0)  # cents
    projected_cost: int = Field(ge=0)  # cents
    target_irr: float | None = None
    target_equity_multiple: float | None = None
    pro_forma_lines: list[ProFormaLineInput] = []


class ProFormaLineItemRead(BaseModel):
    id: str
    category: str
    line_name: str
    original_plan_amount: int
    current_forecast_amount: int
    actual_cleared_amount: int | None = None
    basis: str
    variance_amount: int
    variance_rationale: str | None = None
    notes: str | None = None


class FinancialPlanRead(BaseModel):
    id: str
    organization_id: str
    project_id: str
    version_number: int
    plan_type: str
    projected_revenue: int
    projected_cost: int
    target_irr: float | None = None
    target_equity_multiple: float | None = None
    is_active: bool
    created_at: str
    pro_forma_lines: list[ProFormaLineItemRead] = []


class ProjectEconomicsRead(BaseModel):
    project_id: str
    lifecycle_stage: str
    gross_development_value: int
    net_sales_proceeds: int
    total_hard_costs: int
    total_soft_costs: int
    carrying_financing_cost: int
    total_cost: int
    net_profit: int
    return_on_cost_pct: float
    equity_multiple: float
    irr_pct: float | None = None
    irr_status: str  # VERIFIED, NOT_MEANINGFUL, ESTIMATED
    irr_status_explanation: str
    sponsor_equity_invested: int
    lp_equity_invested: int
    senior_debt_drawn: int
    senior_debt_repaid: int
    senior_debt_balance: int
    total_distributions: int
    is_forecast_complete: bool = True
    missing_input_reasons: list[str] = []
    pro_forma_lines: list[ProFormaLineItemRead] = []


# ---------------------------------------------------------
# Contributions & Distributions
# ---------------------------------------------------------
class InvestorContributionCreate(BaseModel):
    investor_party_id: str
    amount: int = Field(gt=0)
    received_date: date
    transaction_id: str | None = None
    notes: str | None = None


class InvestorContributionRead(BaseModel):
    id: str
    project_investor_id: str
    investor_name: str
    amount: int
    received_date: str
    transaction_id: str | None = None
    created_at: str


class InvestorDistributionCreate(BaseModel):
    project_investor_id: str
    amount: int = Field(gt=0)
    distribution_date: date
    distribution_type: str = "RETURN_OF_CAPITAL"  # RETURN_OF_CAPITAL, PROFIT
    transaction_id: str | None = None


class InvestorDistributionRead(BaseModel):
    id: str
    project_investor_id: str
    investor_name: str
    amount: int
    distribution_date: str
    distribution_type: str
    transaction_id: str | None = None
    created_at: str


# ---------------------------------------------------------
# Disposition & Closeout
# ---------------------------------------------------------
class DispositionImportRequest(BaseModel):
    sale_price: int = Field(ge=0)  # cents
    closing_date: date
    settlement_costs: int = Field(default=0, ge=0)
    net_proceeds: int = Field(ge=0)
    buyer_party_id: str | None = None
    notes: str | None = None


class DispositionRead(BaseModel):
    id: str
    project_id: str
    sale_price: int
    closing_date: str
    settlement_costs: int
    net_proceeds: int
    notes: str | None = None
    created_at: str


class CloseoutApprovalRequest(BaseModel):
    grant_exception: bool = False
    exception_reason: str | None = None
    notes: str | None = None


class PostCloseoutAdjustmentRequest(BaseModel):
    category: str  # WARRANTY_COST, LEGAL_SETTLEMENT, TAX_ADJUSTMENT, RETURN_ADJUSTMENT
    amount: int = Field(gt=0)
    description: str = Field(min_length=1)
    adjustment_date: date


class PostCloseoutAdjustmentRead(BaseModel):
    id: str
    project_id: str
    category: str
    amount: int
    description: str
    adjustment_date: str
    created_at: str


# ---------------------------------------------------------
# Investor Sharing & Snapshots
# ---------------------------------------------------------
class InvestorUpdateCreate(BaseModel):
    title: str = Field(min_length=1)
    progress_summary: str = Field(min_length=1)
    material_disclosures: list[str] = []
    recipients: list[str] = []
    expiry_date: date | None = None


class InvestorUpdatePatch(BaseModel):
    title: str | None = None
    progress_summary: str | None = None
    material_disclosures: list[str] | None = None
    recipients: list[str] | None = None
    expiry_date: date | None = None


class InvestorUpdatePublishRequest(BaseModel):
    material_warnings_acknowledged: bool = False
    recipients: list[str] = []
    expiry_date: date | None = None


class InvestorUpdateWithdrawRequest(BaseModel):
    reason: str = Field(min_length=1)


class InvestorUpdateRead(BaseModel):
    id: str
    project_id: str
    title: str
    as_of_date: str
    status: str  # DRAFT, PUBLISHED, WITHDRAWN
    published_at: str | None = None
    gross_development_value: int
    current_forecast_profit: int
    senior_debt_drawn: int
    equity_funded: int
    progress_summary: str
    material_disclosures: list[str]
    recipients: list[str] = []
    expiry_date: str | None = None
    withdrawn_at: str | None = None
    withdrawal_reason: str | None = None
    created_at: str


class InvestorProjectView(BaseModel):
    id: str
    name: str
    project_entity: str
    address: str
    lifecycle_stage: str
    currency: str
    latest_update: InvestorUpdateRead | None = None

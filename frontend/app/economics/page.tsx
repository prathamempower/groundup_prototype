"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { KeyFigure } from "@/components/ui/key-figure";
import {
  ProjectEconomics,
  ProFormaLineItem,
  DispositionUnit,
  SourceCitation,
} from "@/lib/types";
import { formatMoney, formatDate } from "@/lib/format";
import {
  TrendingUp,
  ShieldCheck,
  DollarSign,
  Landmark,
  Home,
  FileText,
  Lock,
  ArrowUpRight,
  Plus,
  Clock,
  Layers,
  PieChart,
} from "lucide-react";
import { ProFormaTable } from "@/components/economics/pro-forma-table";
import { InvestorLedgerPanel } from "@/components/economics/investor-ledger-panel";
import { DispositionUnitsTable } from "@/components/economics/disposition-units-table";
import { CloseoutChecklistCard } from "@/components/economics/closeout-checklist-card";
import { RecordContributionModal } from "@/components/economics/record-contribution-modal";
import { RecordDistributionModal } from "@/components/economics/record-distribution-modal";
import { RecordUnitSaleModal } from "@/components/economics/record-unit-sale-modal";
import { ApproveCloseoutModal } from "@/components/economics/approve-closeout-modal";
import { PostCloseoutAdjustmentModal } from "@/components/economics/post-closeout-adjustment-modal";

export default function EconomicsPage() {
  const [activeTab, setActiveTab] = useState<
    "PRO_FORMA" | "COST_BREAKDOWN" | "CAPITAL" | "DISPOSITION" | "CLOSEOUT"
  >("PRO_FORMA");

  // Modals state
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [isRecordSaleModalOpen, setIsRecordSaleModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<DispositionUnit | null>(null);
  const [isApproveCloseoutModalOpen, setIsApproveCloseoutModalOpen] = useState(false);
  const [isPostCloseoutModalOpen, setIsPostCloseoutModalOpen] = useState(false);

  // Active Project Query
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: () => api.projects.list(),
  });

  const currentProjectId =
    projectsData?.data?.current_project_id || "";
  const currentProject = projectsData?.data?.projects?.find(
    (p) => p.id === currentProjectId
  );

  const isClosedProject = currentProject?.lifecycle_stage === "CLOSED";

  // Economics Query
  const { data: economicsData, isLoading: isEconomicsLoading } = useQuery({
    queryKey: ["economics", currentProjectId],
    queryFn: () => api.economics.getEconomics(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const economics = economicsData?.data;

  // Pro Forma Lines Query
  const { data: proFormaData } = useQuery({
    queryKey: ["proForma", currentProjectId],
    queryFn: () => api.economics.getProForma(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const proFormaLines = proFormaData?.data || economics?.pro_forma_lines || [];

  // Investor Contributions Query
  const { data: contributionsData } = useQuery({
    queryKey: ["contributions", currentProjectId],
    queryFn: () => api.economics.getInvestorContributions(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const contributions = contributionsData?.data || [];

  // Investor Distributions Query
  const { data: distributionsData } = useQuery({
    queryKey: ["distributions", currentProjectId],
    queryFn: () => api.economics.getInvestorDistributions(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const distributions = distributionsData?.data || [];

  // Disposition Units Query
  const { data: unitsData } = useQuery({
    queryKey: ["dispositionUnits", currentProjectId],
    queryFn: () => api.economics.getDispositionUnits(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const dispositionUnits = unitsData?.data || [];

  // Closeout Report Query
  const { data: closeoutData } = useQuery({
    queryKey: ["closeoutReport", currentProjectId],
    queryFn: () => api.economics.getCloseoutReport(currentProjectId),
    enabled: Boolean(currentProjectId),
  });

  const closeoutReport = closeoutData?.data;

  // The current user determines which economics actions are available.
  const { data: currentUserData } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.identity.getMe(),
  });

  const currentRole = currentUserData?.data?.role;
  const isOwnerOrCFO = currentRole === "OWNER" || currentRole === "CFO";

  const handleOpenRecordSale = (unit: DispositionUnit) => {
    setSelectedUnit(unit);
    setIsRecordSaleModalOpen(true);
  };

  // Citations for Sources Modal
  const gdvCitations: SourceCitation[] = [
    {
      document_id: "doc_73_proforma",
      document_name: "73_Broadway_Approved_Offering_Pro_Forma.pdf",
      page_number: 2,
      reviewer: "Marcus Vance (Owner)",
      reviewed_at: "2025-03-10T14:00:00Z",
      extraction_version: "v1.4",
    },
  ];

  const costCitations: SourceCitation[] = [
    {
      document_id: "doc_73_budget_master",
      document_name: "73_Broadway_Master_Budget_Schedule_of_Values.pdf",
      page_number: 1,
      reviewer: "Sarah Lin (CFO)",
      reviewed_at: "2025-04-01T09:30:00Z",
      extraction_version: "v2.0",
    },
  ];

  const profitCitations: SourceCitation[] = [
    {
      document_id: "doc_73_proforma",
      document_name: "73_Broadway_Approved_Offering_Pro_Forma.pdf",
      page_number: 5,
      reviewer: "Sarah Lin (CFO)",
      reviewed_at: "2025-04-01T10:15:00Z",
      extraction_version: "v2.0",
    },
  ];

  const returnCitations: SourceCitation[] = [
    {
      document_id: "doc_392_closeout",
      document_name: "392_First_St_Final_Audited_Settlement_and_IRR_Model.xlsx",
      page_number: 1,
      reviewer: "Sarah Lin (CFO)",
      reviewed_at: "2025-02-14T16:30:00Z",
      extraction_version: "v1.0",
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Economics & Pro Forma"
        statusBadge={{
          label: isClosedProject ? "Audited Closeout & Final Returns" : "Active Construction Forecast",
          variant: isClosedProject ? "success" : "warning",
          icon: <ShieldCheck className="h-3.5 w-3.5" />,
        }}
        description="Original plan vs current forecast, investor waterfall distributions, unit disposition, and final closeout audit"
        primaryAction={
          isClosedProject ? (
            <button
              onClick={() => setIsPostCloseoutModalOpen(true)}
              className="flex items-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-body font-medium text-text-primary hover:bg-subtle shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Record Post-Closeout Adjustment
            </button>
          ) : (
            <button
              onClick={() => setIsContributionModalOpen(true)}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-body font-medium text-white hover:bg-primary-hover focus-visible:outline-primary shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Record Equity Contribution
            </button>
          )
        }
      />

      <div className="px-6 max-w-7xl mx-auto space-y-6">
        {/* 4 Core Financial KPI Figures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KeyFigure
            label="Gross Development Value (GDV)"
            value={formatMoney(economics?.gross_development_value || "650000000")}
            basis={
              isClosedProject
                ? "Actual realized gross proceeds from 12 closed condominium unit HUD-1 settlements."
                : "Pro-forma gross disposition value across 8 luxury residential units + commercial retail."
            }
            variance={
              isClosedProject
                ? {
                    formattedAmount: "+$200,000.00",
                    isFavorable: true,
                    comparisonLabel: "vs Original Plan ($6.20M)",
                  }
                : undefined
            }
            citations={gdvCitations}
          />

          <KeyFigure
            label="Total Project Cost"
            value={formatMoney(economics?.total_cost || "528775000")}
            basis={
              isClosedProject
                ? "Final audited total cost including hard ($3.85M), soft ($250k), and loan financing ($1.18M)."
                : "Current forecast total cost including hard ($4.46M), soft ($280k), and carrying cost ($547.75k with 45d delay carry)."
            }
            variance={
              !isClosedProject
                ? {
                    formattedAmount: "+$87,750.00",
                    isFavorable: false,
                    comparisonLabel: "vs Baseline ($5.20M)",
                  }
                : undefined
            }
            citations={costCitations}
          />

          <KeyFigure
            label="Net Development Profit"
            value={formatMoney(economics?.net_profit || "121225000")}
            basis={
              isClosedProject
                ? "Final realized net profit after loan discharge, closing costs, and trade settlements."
                : "Forecast net development profit subject to construction completion and 45-day delay carrying cost."
            }
            variance={{
              formattedAmount: `${economics?.return_on_cost_pct || 22.9}% ROC`,
              isFavorable: true,
              comparisonLabel: "Return on Cost",
            }}
            citations={profitCitations}
          />

          <KeyFigure
            label="Net Internal Rate of Return (IRR)"
            value={
              economics?.irr_status === "NOT_MEANINGFUL"
                ? "Not Meaningful"
                : `${economics?.irr_pct}% Net IRR`
            }
            basis={
              economics?.irr_status_explanation ||
              (isClosedProject
                ? "Audited final return calculated from dated capital calls and sales payoff distributions."
                : "Withheld: Required dated exit cash flows are missing during active construction phase.")
            }
            variance={
              isClosedProject
                ? {
                    formattedAmount: `${economics?.equity_multiple || 1.85}x EMx`,
                    isFavorable: true,
                    comparisonLabel: "Equity Multiple",
                  }
                : undefined
            }
            citations={returnCitations}
          />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="flex space-x-6 overflow-x-auto text-caption font-semibold">
            <button
              onClick={() => setActiveTab("PRO_FORMA")}
              className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "PRO_FORMA"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Pro Forma & Economics
            </button>

            <button
              onClick={() => setActiveTab("COST_BREAKDOWN")}
              className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "COST_BREAKDOWN"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Layers className="h-4 w-4" />
              Cost Forecast & Variance
            </button>

            <button
              onClick={() => setActiveTab("CAPITAL")}
              className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "CAPITAL"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Landmark className="h-4 w-4" />
              Capital Stack & Investors ({contributions.length + distributions.length})
            </button>

            <button
              onClick={() => setActiveTab("DISPOSITION")}
              className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "DISPOSITION"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <Home className="h-4 w-4" />
              Disposition & Unit Sales ({dispositionUnits.length})
            </button>

            <button
              onClick={() => setActiveTab("CLOSEOUT")}
              className={`pb-3 transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "CLOSEOUT"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Closeout & Audited Returns
            </button>
          </nav>
        </div>

        {/* Tab 1: Pro Forma & Economics */}
        {activeTab === "PRO_FORMA" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-body font-bold text-text-primary">
                  Master Pro Forma Schedule of Values & Assumptions
                </h3>
                <p className="text-caption text-text-secondary">
                  Side-by-side comparison of initial underwriting plan vs current live forecast with verified basis classification.
                </p>
              </div>
            </div>

            <ProFormaTable
              lines={proFormaLines}
              isClosedProject={isClosedProject}
            />
          </div>
        )}

        {/* Tab 2: Cost Forecast & Variance */}
        {activeTab === "COST_BREAKDOWN" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-body font-bold text-text-primary">
                  Forecast Cost Variance Attribution
                </h3>
                <p className="text-caption text-text-secondary">
                  Detailed variance explanations bridging baseline approval to current completion forecast.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-subtle/30 p-4 space-y-2">
                  <div className="text-caption font-bold text-text-primary">
                    1. Approved Change Orders & Scope Adjustments
                  </div>
                  <ul className="text-caption text-text-secondary space-y-1.5 list-disc list-inside">
                    <li>
                      <strong className="text-text-primary">CO-01 Subgrade Rock Ledge:</strong> +$20,000.00 funded from Contingency line 20-000.
                    </li>
                    <li>
                      <strong className="text-text-primary">CO-02 Structural Steel Surcharge:</strong> +$80,000.00 ASTM A992 wide-flange mill surcharge funded from Contingency.
                    </li>
                    <li>
                      <strong className="text-text-primary">CO-03 HVAC VRF Efficiency Upgrade:</strong> +$50,000.00 rooftop VRF heat pump upgrade funded from Contingency.
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-danger/30 bg-danger-subtle/30 p-4 space-y-2">
                  <div className="text-caption font-bold text-danger">
                    2. Schedule Delay Financing Carry Cost Exposure
                  </div>
                  <p className="text-caption text-text-secondary">
                    Structural steel fabrication delay pushes milestone completion by 45 days. At $18,500/month carrying cost on senior construction debt, carrying cost accumulates <strong className="text-danger">+$27,750.00</strong> in projected interest exposure.
                  </p>
                </div>
              </div>

              <ProFormaTable
                lines={proFormaLines.filter((l) => l.category !== "REVENUE")}
                isClosedProject={isClosedProject}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Capital Stack & Investors */}
        {activeTab === "CAPITAL" && (
          <InvestorLedgerPanel
            economics={economics}
            contributions={contributions}
            distributions={distributions}
            onOpenContributionModal={() => setIsContributionModalOpen(true)}
            onOpenDistributionModal={() => setIsDistributionModalOpen(true)}
          />
        )}

        {/* Tab 4: Disposition & Unit Sales */}
        {activeTab === "DISPOSITION" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-body font-bold text-text-primary">
                  Condominium & Commercial Unit Disposition Register
                </h3>
                <p className="text-caption text-text-secondary">
                  Track individual purchase contracts, HUD-1 settlement allocations, and net cash proceeds.
                </p>
              </div>
            </div>

            <DispositionUnitsTable
              units={dispositionUnits}
              onOpenRecordSaleModal={handleOpenRecordSale}
            />
          </div>
        )}

        {/* Tab 5: Closeout & Audited Returns */}
        {activeTab === "CLOSEOUT" && (
          <CloseoutChecklistCard
            report={closeoutReport}
            onOpenApproveCloseoutModal={() => setIsApproveCloseoutModalOpen(true)}
            onOpenPostCloseoutAdjustmentModal={() => setIsPostCloseoutModalOpen(true)}
            isOwnerOrCFO={isOwnerOrCFO}
          />
        )}
      </div>

      {/* Action Modals */}
      <RecordContributionModal
        open={isContributionModalOpen}
        onOpenChange={setIsContributionModalOpen}
        projectId={currentProjectId}
      />

      <RecordDistributionModal
        open={isDistributionModalOpen}
        onOpenChange={setIsDistributionModalOpen}
        projectId={currentProjectId}
      />

      <RecordUnitSaleModal
        open={isRecordSaleModalOpen}
        onOpenChange={setIsRecordSaleModalOpen}
        unit={selectedUnit}
        projectId={currentProjectId}
      />

      <ApproveCloseoutModal
        open={isApproveCloseoutModalOpen}
        onOpenChange={setIsApproveCloseoutModalOpen}
        report={closeoutReport || null}
        projectId={currentProjectId}
      />

      <PostCloseoutAdjustmentModal
        open={isPostCloseoutModalOpen}
        onOpenChange={setIsPostCloseoutModalOpen}
        projectId={currentProjectId}
      />
    </div>
  );
}

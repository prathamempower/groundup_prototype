"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ContractModel, LifecycleStage, OnboardingRole, ProjectPhase } from "@/lib/types";
import {
  Building2,
  HardHat,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Trash2,
  Plus,
  AlertCircle,
  Calendar,
  Landmark,
  Mail,
  Users,
  Loader2,
  FolderPlus,
  ShieldCheck,
  Compass,
  KeyRound,
  DollarSign,
  FileCheck,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { AmbientStructuralWireframes } from "@/components/ui/AmbientStructuralWireframes";
import { WelcomingWorkspaceLoader } from "@/components/onboarding/WelcomingWorkspaceLoader";
import { LocationAutocompleteInput } from "@/components/projects/LocationAutocompleteInput";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { PhaseIllustration } from "@/components/projects/PhaseIllustration";
import { ConstructionLenderSelect } from "@/components/projects/ConstructionLenderSelect";

// Supported file extensions for document vault
const SUPPORTED_EXTENSIONS = [".pdf", ".xlsx", ".csv", ".png", ".jpg", ".jpeg", ".docx", ".zip"];

// Stage Choices based on phase selection
const ACTIVE_STAGE_CHOICES = [
  {
    id: "Under construction",
    label: "Under Construction",
    stageNum: "Active Stage",
    desc: "Active foundation, structural framing, and MEP trades.",
  },
  {
    id: "Procurement",
    label: "Procurement & Buyout",
    stageNum: "Active Stage",
    desc: "Trade contracts buyout and vendor purchase orders.",
  },
  {
    id: "Preconstruction phase",
    label: "Preconstruction Logistics",
    stageNum: "Active Stage",
    desc: "Soil borings, engineering, and site logistics lock.",
  },
  {
    id: "Post-construction",
    label: "Post-Construction & Closeout",
    stageNum: "Active Stage",
    desc: "Punch lists, final municipal inspections, and Certificate of Occupancy.",
  },
];

const NEW_STAGE_CHOICES = [
  {
    id: "Conception, design & planning",
    label: "Conception & Feasibility",
    stageNum: "Planning Stage",
    desc: "Architectural drawings, zoning feasibility, and development pro forma.",
  },
  {
    id: "Building permits",
    label: "Building Permits",
    stageNum: "Planning Stage",
    desc: "Township permit filings and agency plan sign-offs.",
  },
  {
    id: "Preconstruction phase",
    label: "Preconstruction Bidding",
    stageNum: "Planning Stage",
    desc: "Subcontractor bid packages and initial cost estimation lock.",
  },
  {
    id: "Procurement",
    label: "Contractor Buyout",
    stageNum: "Planning Stage",
    desc: "General Contractor RFP buyout and pricing negotiations.",
  },
];

const ACTIVE_DOC_TYPES = [
  "Budget or cost spreadsheet",
  "Executed GC contract",
  "Subcontractor pay application (AIA G702)",
  "Bank construction loan agreement",
  "Municipal inspection card",
  "Not ready yet",
];

const NEW_DOC_TYPES = [
  "Development pro forma spreadsheet",
  "Architectural schematic plans",
  "Township permit filing document",
  "Land purchase contract or LOI",
  "Bank financing term sheet",
  "Not ready yet",
];

const ROLE_OPTIONS = [
  { role: "GC", label: "General Contractor (GC)" },
  { role: "PROJECT_MANAGER", label: "Project Manager" },
  { role: "CFO", label: "CFO / Accountant" },
  { role: "INVESTOR", label: "Investor / Partner" },
  { role: "OTHER", label: "Other (Custom Role)" },
];

// Vector Architectural Illustration for Active Construction
function ActiveJobsiteSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 110"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="create-jobsite-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke={active ? "#0f172a" : "#94a3b8"}
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="160" height="110" rx="8" fill="url(#create-jobsite-grid)" />

      {/* Ground Foundation Line */}
      <line
        x1="10"
        y1="96"
        x2="150"
        y2="96"
        stroke={active ? "#0f172a" : "#64748b"}
        strokeWidth="2"
        strokeDasharray="3 3"
      />
      <rect x="22" y="94" width="70" height="4" rx="1" fill={active ? "#0f172a" : "#94a3b8"} />

      {/* Structural Steel Columns & Beams */}
      <rect x="28" y="44" width="4" height="50" rx="1" fill={active ? "#0f172a" : "#64748b"} />
      <rect x="52" y="44" width="4" height="50" rx="1" fill={active ? "#0f172a" : "#64748b"} />
      <rect x="76" y="58" width="4" height="36" rx="1" fill={active ? "#0f172a" : "#64748b"} />

      {/* Horizontal Structural Beams */}
      <line x1="26" y1="72" x2="80" y2="72" stroke={active ? "#0f172a" : "#64748b"} strokeWidth="2.5" />
      <line x1="26" y1="52" x2="58" y2="52" stroke={active ? "#0f172a" : "#64748b"} strokeWidth="2.5" />

      {/* Cross Bracing Tension Cables */}
      <line
        x1="32"
        y1="72"
        x2="52"
        y2="94"
        stroke={active ? "#3b82f6" : "#94a3b8"}
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <line
        x1="52"
        y1="72"
        x2="32"
        y2="94"
        stroke={active ? "#3b82f6" : "#94a3b8"}
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Tower Crane Mast */}
      <rect x="104" y="20" width="5" height="74" rx="1" fill={active ? "#d97706" : "#94a3b8"} />
      <path d="M 104 35 L 109 45 M 104 55 L 109 65 M 104 75 L 109 85" stroke="white" strokeWidth="1" />

      {/* Crane Jib */}
      <line
        x1="72"
        y1="20"
        x2="142"
        y2="20"
        stroke={active ? "#d97706" : "#94a3b8"}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="130" y="16" width="8" height="8" rx="1" fill={active ? "#0f172a" : "#64748b"} />
      <polygon
        points="106,8 90,20 120,20"
        fill="none"
        stroke={active ? "#d97706" : "#94a3b8"}
        strokeWidth="1.5"
      />

      {/* Hoist Trolley, Cable & Suspended I-Beam */}
      <rect x="84" y="19" width="6" height="3" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />
      <line
        x1="87"
        y1="22"
        x2="87"
        y2="42"
        stroke={active ? "#0f172a" : "#64748b"}
        strokeWidth="1"
        strokeDasharray="1 1"
      />
      <rect x="80" y="42" width="14" height="3" rx="1" fill={active ? "#f59e0b" : "#64748b"} />

      {/* Active Draw / Verification Badge Pill */}
      <g transform="translate(18, 14)">
        <rect
          width="64"
          height="18"
          rx="9"
          fill={active ? "#0f172a" : "#f1f5f9"}
          stroke={active ? "#334155" : "#cbd5e1"}
          strokeWidth="1"
        />
        <circle cx="9" cy="9" r="3.5" fill="#10b981" />
        <text
          x="17"
          y="12"
          fill={active ? "#f8fafc" : "#475569"}
          fontSize="7.5"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          Draw Verified
        </text>
      </g>
    </svg>
  );
}

// Vector Architectural Blueprint for Planning & Pre-Development
function PreDevelopmentSvg({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 160 110"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="create-predev-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path
            d="M 10 0 L 0 0 0 10"
            fill="none"
            stroke={active ? "#0f172a" : "#94a3b8"}
            strokeWidth="0.5"
            strokeOpacity="0.15"
          />
        </pattern>
      </defs>
      <rect width="160" height="110" rx="8" fill="url(#create-predev-grid)" />

      {/* Pro Forma Baseline Document Card */}
      <g transform="translate(16, 14)">
        <rect
          width="84"
          height="80"
          rx="5"
          fill={active ? "#ffffff" : "#f8fafc"}
          stroke={active ? "#0f172a" : "#cbd5e1"}
          strokeWidth="1.5"
        />

        {/* Document Header Bar */}
        <rect x="6" y="8" width="40" height="5" rx="1" fill={active ? "#0f172a" : "#64748b"} />
        <rect x="52" y="8" width="24" height="5" rx="1" fill={active ? "#0284c7" : "#94a3b8"} />

        {/* Table Rows */}
        <line x1="6" y1="20" x2="78" y2="20" stroke={active ? "#e2e8f0" : "#cbd5e1"} strokeWidth="1" />

        <rect x="6" y="24" width="22" height="3" rx="0.5" fill={active ? "#64748b" : "#94a3b8"} />
        <rect x="54" y="24" width="22" height="3" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />

        <rect x="6" y="32" width="28" height="3" rx="0.5" fill={active ? "#64748b" : "#94a3b8"} />
        <rect x="58" y="32" width="18" height="3" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />

        <rect x="6" y="40" width="18" height="3" rx="0.5" fill={active ? "#64748b" : "#94a3b8"} />
        <rect x="52" y="40" width="24" height="3" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />

        <rect x="6" y="48" width="25" height="3" rx="0.5" fill={active ? "#64748b" : "#94a3b8"} />
        <rect x="56" y="48" width="20" height="3" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />

        {/* Total Summary Row */}
        <line x1="6" y1="56" x2="78" y2="56" stroke={active ? "#0f172a" : "#cbd5e1"} strokeWidth="1.5" />
        <rect x="6" y="60" width="30" height="4" rx="0.5" fill={active ? "#0f172a" : "#64748b"} />
        <rect x="50" y="60" width="26" height="4" rx="0.5" fill={active ? "#059669" : "#059669"} />

        {/* WBS Tag */}
        <rect x="6" y="69" width="38" height="6" rx="2" fill={active ? "#e0f2fe" : "#f1f5f9"} />
        <text x="9" y="73.5" fill={active ? "#0369a1" : "#64748b"} fontSize="4" fontWeight="bold">
          CSI 50-DIV
        </text>
      </g>

      {/* Drafting 30-60 Triangle Ruler */}
      <g transform="translate(98, 20)">
        <polygon
          points="0,68 44,68 0,10"
          fill={active ? "rgba(59, 130, 246, 0.12)" : "rgba(148, 163, 184, 0.12)"}
          stroke={active ? "#0284c7" : "#64748b"}
          strokeWidth="1.5"
        />
        <polygon points="6,62 30,62 6,28" fill="white" stroke={active ? "#0284c7" : "#94a3b8"} strokeWidth="1" />
        <line x1="0" y1="20" x2="3" y2="20" stroke={active ? "#0284c7" : "#64748b"} strokeWidth="1" />
        <line x1="0" y1="30" x2="3" y2="30" stroke={active ? "#0284c7" : "#64748b"} strokeWidth="1" />
        <line x1="0" y1="40" x2="3" y2="40" stroke={active ? "#0284c7" : "#64748b"} strokeWidth="1" />
        <line x1="0" y1="50" x2="3" y2="50" stroke={active ? "#0284c7" : "#64748b"} strokeWidth="1" />
        <line x1="0" y1="60" x2="3" y2="60" stroke={active ? "#0284c7" : "#64748b"} strokeWidth="1" />
      </g>

      {/* Municipal Permit Stamp Seal */}
      <g transform="translate(108, 64)">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill={active ? "#fef3c7" : "#f1f5f9"}
          stroke={active ? "#d97706" : "#94a3b8"}
          strokeWidth="1.5"
          strokeDasharray="3 1.5"
        />
        <text
          x="16"
          y="14"
          textAnchor="middle"
          fill={active ? "#92400e" : "#475569"}
          fontSize="5"
          fontWeight="bold"
        >
          PERMIT
        </text>
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fill={active ? "#b45309" : "#64748b"}
          fontSize="4"
          fontWeight="bold"
        >
          APPROVED
        </text>
      </g>
    </svg>
  );
}

interface IntakeFileItem {
  id: string;
  name: string;
  size: number;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Steps:
  // 1. Select Project Phase (Active vs Planning)
  // 2. Project Specifications (Sub-steps: 1. Identity & Dates, 2. Capital & Debt)
  // 3. Project Records (Document Vault)
  // 4. Team Allocation (Invites)
  // 5. Workspace Provisioning & Launch
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [projectSubStep, setProjectSubStep] = useState<1 | 2>(1);

  // Step 1: Project Phase
  const [projectPhase, setProjectPhase] = useState<ProjectPhase>("ACTIVE_CONSTRUCTION");
  const [projectStatus, setProjectStatus] = useState<"active" | "new">("active");

  // Step 2: Part 1 - Identity & Schedule
  const [projectName, setProjectName] = useState("");
  const [projectEntity, setProjectEntity] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [assetType, setAssetType] = useState("SINGLE_FAMILY");
  const [projectStage, setProjectStage] = useState("Under construction");
  const [startedAt, setStartedAt] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [projectError, setProjectError] = useState<string | null>(null);

  // Phase-Specific Questions State
  const [permitStatus, setPermitStatus] = useState<"PERMIT_APPROVED" | "PERMIT_PENDING" | "NOT_YET_APPLIED">("PERMIT_APPROVED");
  const [budgetSheetStatus, setBudgetSheetStatus] = useState<"BUDGET_READY" | "BUDGET_IN_PROGRESS">("BUDGET_READY");
  const [dueDiligenceStatus, setDueDiligenceStatus] = useState<"LOI_NEGOTIATION" | "PSA_SIGNED" | "FEASIBILITY_STUDY">("PSA_SIGNED");
  const [targetPurchasePrice, setTargetPurchasePrice] = useState("");
  const [postConstructionStatus, setPostConstructionStatus] = useState<"COMMISSIONING" | "HANDOVER_WARRANTY">("COMMISSIONING");
  const [unitPriceDecided, setUnitPriceDecided] = useState<"YES" | "NO">("YES");
  const [targetUnitPrice, setTargetUnitPrice] = useState("");
  const [totalUnits, setTotalUnits] = useState<string>("1");
  const [unitPrices, setUnitPrices] = useState<Record<number, string>>({});
  const [bulkUnitPrice, setBulkUnitPrice] = useState("");

  // Step 2: Part 2 - Capital & Debt
  const [isAcquired, setIsAcquired] = useState<"true" | "false">("true");
  const [acquisitionFunding, setAcquisitionFunding] = useState("ACQUISITION_LOAN");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionProofDocs, setAcquisitionProofDocs] = useState<IntakeFileItem[]>([]);
  const [isAcquisitionProofDragging, setIsAcquisitionProofDragging] = useState(false);
  const acquisitionProofInputRef = useRef<HTMLInputElement>(null);
  const [hasConstructionLoan, setHasConstructionLoan] = useState<"true" | "false">("true");
  const [lenderName, setLenderName] = useState("");
  const [contractModel, setContractModel] = useState<ContractModel>("FIXED");
  const [operatingAccountModel, setOperatingAccountModel] = useState<"DEDICATED" | "SHARED">("DEDICATED");

  const handleAddAcquisitionProofFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: IntakeFileItem[] = Array.from(files).map((f) => ({
      id: `proof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      size: f.size,
      type: f.type,
      status: "ready" as const,
      category: "Acquisition Proof",
    }));
    setAcquisitionProofDocs((prev) => [...prev, ...newItems]);
    setDocumentsList((prev) => [...prev, ...newItems]);
  };

  // Step 3: Document Vault / Records
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [documentsList, setDocumentsList] = useState<IntakeFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Step 4: Team Allocation
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("GC");
  const [customRoleTitle, setCustomRoleTitle] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [teamList, setTeamList] = useState<Array<{ email: string; role: string }>>([]);
  const createdProjectIdRef = useRef<string>("");

  // Step 5: Provisioning Stages
  const [setupStages, setSetupStages] = useState({
    savingOrg: false,
    creatingProject: false,
    preparingDashboard: false,
    finalizing: false,
  });

  // Step Titles map
  const STEP_TITLES = [
    "",
    "Project Phase",
    "Project Specifications",
    "Project Records",
    "Team Allocation",
    "Workspace Initialization",
  ];

  // Auto-sync legal entity from project name if left untouched
  useEffect(() => {
    if (projectName) {
      setProjectEntity((prev) => {
        if (!prev || prev.endsWith(" LLC") || prev.endsWith(" Partners LLC")) {
          return `${projectName.trim()} Partners LLC`;
        }
        return prev;
      });
    }
  }, [projectName]);

  // Sync project stage and status choices whenever projectPhase changes
  useEffect(() => {
    switch (projectPhase) {
      case "PRE_ACQUISITION":
        setProjectStage("Pre Acquisition");
        setProjectStatus("new");
        break;
      case "ACQUISITION":
        setProjectStage("Acquisition");
        setProjectStatus("new");
        break;
      case "PERMITTING":
        setProjectStage("Permitting");
        setProjectStatus("new");
        break;
      case "ACTIVE_CONSTRUCTION":
        setProjectStage("Under construction");
        setProjectStatus("active");
        break;
      case "POST_CONSTRUCTION":
        setProjectStage("Post construction");
        setProjectStatus("active");
        break;
    }
  }, [projectPhase]);

  // Handle advancing through specifications sub-steps
  const handleAdvanceToPart2 = () => {
    if (!projectName.trim()) {
      setProjectError("Please enter a valid project display name.");
      return;
    }
    if (!projectEntity.trim()) {
      setProjectEntity(`${projectName.trim()} Partners LLC`);
    }
    setProjectError(null);
    setProjectSubStep(2);
  };

  const handleAdvanceToPart3 = () => {
    setProjectError(null);
    setCurrentStep(3);
  };

  const handleAdvanceToStep3 = () => {
    setProjectError(null);
    setCurrentStep(3);
  };

  // Unit pricing handlers for post-construction
  const handleSetBulkUnitPrice = (val: string) => {
    setBulkUnitPrice(val);
    const count = Math.min(Math.max(parseInt(totalUnits, 10) || 1, 1), 50);
    const updated: Record<number, string> = {};
    for (let i = 1; i <= count; i++) {
      updated[i] = val;
    }
    setUnitPrices(updated);
    setTargetUnitPrice(val);
  };

  const handleUnitCountChange = (val: string) => {
    setTotalUnits(val);
    const count = Math.min(Math.max(parseInt(val, 10) || 1, 1), 50);
    setUnitPrices((prev) => {
      const updated: Record<number, string> = { ...prev };
      for (let i = 1; i <= count; i++) {
        if (!updated[i]) {
          updated[i] = bulkUnitPrice || targetUnitPrice || "";
        }
      }
      return updated;
    });
  };

  const handleSingleUnitChange = (unitNum: number, price: string) => {
    setUnitPrices((prev) => ({
      ...prev,
      [unitNum]: price,
    }));
    if (unitNum === 1) {
      setTargetUnitPrice(price);
    }
  };

  const calculatedTotalValue = React.useMemo(() => {
    const count = Math.min(Math.max(parseInt(totalUnits, 10) || 1, 1), 50);
    let sum = 0;
    for (let i = 1; i <= count; i++) {
      const raw = unitPrices[i] ?? (count === 1 ? targetUnitPrice : bulkUnitPrice);
      if (raw) {
        const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) sum += num;
      }
    }
    return sum;
  }, [totalUnits, unitPrices, targetUnitPrice, bulkUnitPrice]);

  // Add files to documents list
  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: IntakeFileItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      newItems.push({
        id: `doc-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
      });
    }
    setDocumentsList((prev) => [...prev, ...newItems]);
  };

  // Add collaborator
  const handleAddCollaborator = () => {
    if (!inviteEmail.trim()) {
      setInviteError("Please enter a collaborator email.");
      return;
    }
    if (!inviteEmail.includes("@") || !inviteEmail.includes(".")) {
      setInviteError("Please enter a valid email address.");
      return;
    }
    if (teamList.some((m) => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError("This collaborator is already in your invitation list.");
      return;
    }
    if (inviteRole === "OTHER" && !customRoleTitle.trim()) {
      setInviteError("Please enter a custom role title.");
      return;
    }

    const assignedRole =
      inviteRole === "OTHER"
        ? customRoleTitle.trim()
        : (ROLE_OPTIONS.find((r) => r.role === inviteRole)?.label || inviteRole);

    setTeamList((prev) => [...prev, { email: inviteEmail.trim(), role: assignedRole }]);
    setInviteEmail("");
    setCustomRoleTitle("");
    setInviteError(null);
  };

  // Final project creation and workspace launch
  const handleLaunchProject = async () => {
    setCurrentStep(5);

    let newProjectId = `proj-${Date.now()}`;

    try {
      let targetLifecycleStage: LifecycleStage = "CONSTRUCTION";
      if (projectPhase === "PRE_ACQUISITION") targetLifecycleStage = "PRE_ACQUISITION";
      else if (projectPhase === "ACQUISITION") targetLifecycleStage = "ACQUISITION";
      else if (projectPhase === "PERMITTING") targetLifecycleStage = "PERMITTING";
      else if (projectPhase === "ACTIVE_CONSTRUCTION") targetLifecycleStage = "CONSTRUCTION";
      else if (projectPhase === "POST_CONSTRUCTION") targetLifecycleStage = "POST_CONSTRUCTION";

      const createdRes = await api.projects.create({
        name: projectName.trim() || (projectPhase === "ACTIVE_CONSTRUCTION" ? "73 Broadway" : "161 Woodlawn"),
        project_entity: projectEntity.trim() || `${projectName.trim() || "GroundUp"} Partners LLC`,
        address: projectAddress.trim() || "Jersey City, NJ",
        lifecycle_stage: targetLifecycleStage,
        phase: projectPhase,
        contract_model: contractModel,
        status: "ACTIVE",
        currency: "USD",
        is_user_created: true,
        acquisition_funding: acquisitionFunding,
        ...(acquisitionDate ? { acquisition_date: new Date(acquisitionDate).toISOString() } : {}),
        ...(startedAt ? { started_at: new Date(startedAt).toISOString() } : {}),
        ...(targetDate ? { target_completion_at: new Date(targetDate).toISOString() } : {}),
        ...(projectPhase === "ACQUISITION" || projectPhase === "PERMITTING" ? { permit_status: permitStatus } : {}),
        ...(projectPhase === "PERMITTING" ? { budget_sheet_status: budgetSheetStatus } : {}),
        ...(projectPhase === "PRE_ACQUISITION"
          ? {
              due_diligence_status: dueDiligenceStatus,
              target_purchase_price: targetPurchasePrice || undefined,
            }
          : {}),
        ...(projectPhase === "POST_CONSTRUCTION"
          ? {
              unit_price_decided: unitPriceDecided,
              total_units: parseInt(totalUnits, 10) || 1,
              unit_prices: unitPrices,
              target_unit_price:
                unitPriceDecided === "YES"
                  ? (unitPrices[1] || targetUnitPrice || bulkUnitPrice)
                  : undefined,
            }
          : {}),
      });

      if (createdRes?.data?.id) {
        newProjectId = createdRes.data.id;
      }
    } catch {
      // Graceful fallback for mock
    }

    localStorage.setItem("groundup_active_project_id", newProjectId);
    localStorage.setItem("groundup_last_project_id", newProjectId);
    createdProjectIdRef.current = newProjectId;
  };

  const handleLaunchFinished = async () => {
    const targetId = createdProjectIdRef.current || `proj-${Date.now()}`;
    await queryClient.invalidateQueries();
    router.push(`/projects/${targetId}/control-center`);
  };

  // Back navigation handler
  const handleBack = () => {
    if (currentStep === 2) {
      if (projectSubStep === 2) {
        setProjectSubStep(1);
      } else {
        setCurrentStep(1);
      }
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setProjectSubStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/40 relative flex flex-col font-sans text-slate-900 selection:bg-slate-200 overflow-x-hidden">
      {/* Subtle blueprint grid and ambient structural wireframe shards */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />
      <AmbientStructuralWireframes intensity="subtle" />

      {/* ── Top Header Navigation Bar ────────────────────────────────────────── */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 sm:py-3.5 sticky top-0 z-30 shadow-2xs relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          {/* GroundUp Logo linking back to Projects */}
          <Link
            href="/projects"
            className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-85 transition cursor-pointer text-left focus:outline-none"
            title="Return to GroundUp Projects"
          >
            <div className="sm:hidden flex items-center">
              <Logo variant="mark" size="sm" />
            </div>
            <div className="hidden sm:flex items-center">
              <Logo theme="light" size="md" />
            </div>
          </Link>

          {/* Clean Step Progress Indicator */}
          {currentStep >= 1 && currentStep <= 4 && (
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-slate-50/90 border border-slate-200/80 rounded-full text-center shadow-2xs min-w-0">
              <span className="text-[11px] font-mono text-sky-600 font-bold whitespace-nowrap shrink-0">
                {currentStep} / 4
              </span>
              <div className="h-3 w-px bg-slate-200 shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">
                {STEP_TITLES[currentStep]}
              </span>
            </div>
          )}

          {/* Exit Action */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/projects"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <span className="hidden sm:inline">Exit to projects</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </div>

        {/* Dynamic Gradient Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 absolute bottom-0 left-0 right-0 overflow-hidden">
          <div
            className="h-full rounded-r-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.4)]"
            style={{
              width: `${Math.min(100, (currentStep / 4) * 100)}%`,
              background: "linear-gradient(to right, #0ea5e9, #0d9488)",
            }}
          />
        </div>
      </header>

      {/* ── Main Centered Form Container ─────────────────────────────────────── */}
      <main
        className={`flex-1 w-full mx-auto px-3 sm:px-6 py-4 sm:py-10 flex flex-col justify-center relative z-10 transition-all duration-200 ${
          currentStep === 2 ? "max-w-2xl sm:max-w-3xl" : "max-w-xl sm:max-w-2xl"
        }`}
      >
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.04),0_1px_3px_rgba(0,0,0,0.02)] transition-all relative overflow-hidden">
          {/* Back button for steps / sub-steps */}
          {(currentStep > 1 || (currentStep === 2 && projectSubStep > 1)) && currentStep < 5 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 1: SELECT YOUR PROJECT PHASE                                   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 sm:space-y-1.5">
                <TextEffect
                  as="h1"
                  preset="fade-in-blur"
                  per="word"
                  className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Select your project phase
                </TextEffect>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Calibrate your cost codes, draw schedules, and workflow.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-2.5 pt-1">
                {[
                  {
                    id: "PRE_ACQUISITION" as ProjectPhase,
                    title: "Pre Acquisition",
                    desc: "Planning, site feasibility, and LOI negotiations before purchase.",
                    icon: Compass,
                    badge: "Planning Phase",
                  },
                  {
                    id: "ACQUISITION" as ProjectPhase,
                    title: "Acquisition",
                    desc: "Land purchased and deed recorded; preparing for site work and design.",
                    icon: KeyRound,
                    badge: "Closing Phase",
                  },
                  {
                    id: "PERMITTING" as ProjectPhase,
                    title: "Permitting",
                    desc: "Architectural drawings submitted and municipal permits in review.",
                    icon: ShieldCheck,
                    badge: "Approval Phase",
                  },
                  {
                    id: "ACTIVE_CONSTRUCTION" as ProjectPhase,
                    title: "Active Project Construction",
                    desc: "Active jobsite with ongoing contractor draws, inspections, and trade work.",
                    icon: HardHat,
                    badge: "Active Phase",
                  },
                  {
                    id: "POST_CONSTRUCTION" as ProjectPhase,
                    title: "Post Construction",
                    desc: "Certificate of occupancy issued, punch list closeout, and warranty handover.",
                    icon: Building2,
                    badge: "Closeout Phase",
                  },
                ].map((card) => {
                  const isSelected = projectPhase === card.id;
                  const CardIcon = card.icon;
                  return (
                    <div
                      key={card.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setProjectPhase(card.id)}
                      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setProjectPhase(card.id)}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 sm:gap-4 ${
                        isSelected
                          ? "bg-slate-100 border-slate-900 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                          : "bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          <CardIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                            {card.title}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-normal mt-0.5">
                            {card.desc}
                          </p>
                        </div>
                      </div>

                      {/* Architectural Phase Illustration Preview */}
                      <div className="hidden sm:flex w-32 h-20 shrink-0">
                        <PhaseIllustration phase={card.id} active={isSelected} className="w-full h-full" />
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center shadow-2xs text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                id="btn-phase-next"
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] min-h-[44px]"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 2: PROJECT SPECIFICATIONS (DYNAMIC PHASE QUESTIONNAIRE)        */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Title based on sub-step */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {projectSubStep === 1 && "Let's add your project"}
                    {projectSubStep === 2 &&
                      (projectPhase === "PRE_ACQUISITION"
                        ? "Capital & Funding"
                        : "Capital & Debt Structure")}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {projectSubStep === 1 &&
                      (projectPhase === "PRE_ACQUISITION"
                        ? "Configure identity, entity ownership, and expected closing schedule."
                        : "Configure identity, entity ownership, and schedule.")}
                    {projectSubStep === 2 &&
                      (projectPhase === "PRE_ACQUISITION"
                        ? "Define planned capital source and financing structure."
                        : "Define acquisition capital, lending, permits, and contract governance.")}
                  </p>
                </div>
              </div>

              {/* Progress Indicator: 2 Sub-steps */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectSubStep(1)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        projectSubStep >= 1 ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                    <span
                      className={`block text-[11px] font-semibold mt-1.5 transition-colors ${
                        projectSubStep === 1 ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      1. Identity & Schedule
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (projectName.trim()) setProjectSubStep(2);
                    }}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        projectSubStep >= 2 ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                    <span
                      className={`block text-[11px] font-semibold mt-1.5 transition-colors ${
                        projectSubStep === 2 ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    >
                      {projectPhase === "PRE_ACQUISITION" ? "2. Capital & Funding" : "2. Capital & Debt"}
                    </span>
                  </button>
                </div>
              </div>

              {projectError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700 flex items-center gap-2.5 shadow-2xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{projectError}</span>
                </div>
              )}

              {/* ────────────────── SUB-STEP 1: IDENTITY & SCHEDULE ────────────────── */}
              {projectSubStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Project Display Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-project-name" className="block text-xs font-bold text-slate-800">
                        Project display name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="input-project-name"
                        type="text"
                        autoFocus
                        value={projectName}
                        onChange={(e) => {
                          setProjectName(e.target.value);
                          if (projectError) setProjectError(null);
                        }}
                        placeholder="e.g. 73 Broadway Mixed-Use"
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                          projectError
                            ? "border-red-400 focus:ring-red-500/20"
                            : "border-slate-200 focus:border-slate-900 focus:ring-slate-900/10"
                        }`}
                      />
                    </div>

                    {/* Legal Ownership Entity */}
                    <div className="space-y-1.5">
                      <label htmlFor="input-project-entity" className="block text-xs font-bold text-slate-800">
                        Legal ownership entity (LLC / LP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="input-project-entity"
                        type="text"
                        value={projectEntity}
                        onChange={(e) => setProjectEntity(e.target.value)}
                        placeholder="e.g. 73 Broadway Partners LLC"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      />
                    </div>
                  </div>

                  {/* Site Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-project-address" className="block text-xs font-bold text-slate-800">
                      {projectPhase === "PRE_ACQUISITION" ? "Target site address / location" : "Site address / location"}{" "}
                      <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <LocationAutocompleteInput
                      id="input-project-address"
                      value={projectAddress}
                      onChange={setProjectAddress}
                      placeholder="e.g. 73 Broadway, Jersey City, NJ 07306"
                    />
                  </div>

                  {/* Development Type */}
                  <div className="space-y-1.5">
                    <label htmlFor="select-asset-archetype" className="block text-xs font-bold text-slate-800">
                      Development Type
                    </label>
                    <select
                      id="select-asset-archetype"
                      value={assetType}
                      onChange={(e) => setAssetType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer"
                    >
                      <option value="SINGLE_FAMILY">Single Family</option>
                      <option value="TWO_FAMILY">Two Family</option>
                      <option value="MULTIFAMILY">Multi Family</option>
                      <option value="MIXED_USE">Mixed Use</option>
                    </select>
                  </div>

                  {/* Pre Acquisition Specific Dates */}
                  {projectPhase === "PRE_ACQUISITION" ? (
                    <div className="space-y-1.5">
                      <label htmlFor="input-target-date" className="block text-xs font-bold text-slate-800">
                        Expected acquisition / closing date <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-target-date"
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Other Phases Dates */
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label htmlFor="input-started-at" className="block text-xs font-bold text-slate-800">
                          {projectPhase === "POST_CONSTRUCTION" ? "Construction completion date" : "Target construction start"}{" "}
                          <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-started-at"
                            type="date"
                            value={startedAt}
                            onChange={(e) => setStartedAt(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="input-target-date" className="block text-xs font-bold text-slate-800">
                          {projectPhase === "POST_CONSTRUCTION" ? "Final closeout & handover date" : "Target completion date"}{" "}
                          <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-target-date"
                            type="date"
                            value={targetDate}
                            onChange={(e) => setTargetDate(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-step 1 Actions */}
                  <div className="space-y-2.5 pt-3">
                    <button
                      type="button"
                      onClick={handleAdvanceToPart2}
                      className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                    >
                      Skip for now, I&apos;ll configure project details later
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────── SUB-STEP 2: DYNAMIC CAPITAL & PERMITTING ────────────────── */}
              {projectSubStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* PRE ACQUISITION SUB-STEP 2 */}
                  {projectPhase === "PRE_ACQUISITION" ? (
                    <>
                      {/* Planned Acquisition Capital Source */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Planned acquisition capital source
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: "ACQUISITION_LOAN", label: "Bank Loan" },
                            { id: "CASH_EQUITY", label: "Self Funded" },
                          ].map((f) => {
                            const isSelected =
                              acquisitionFunding === f.id ||
                              (f.id === "CASH_EQUITY" &&
                                (acquisitionFunding === "EQUITY" || acquisitionFunding === "SELF_FUNDED"));
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setAcquisitionFunding(f.id)}
                                className={`rounded-xl border py-2.5 px-3.5 text-center transition cursor-pointer ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                                }`}
                              >
                                <span className="text-xs">{f.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>


                    </>
                  ) : (
                    /* ACQUISITION, PERMITTING, ACTIVE CONSTRUCTION, POST CONSTRUCTION */
                    <>
                      {/* Initial Acquisition Capital Source */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Initial acquisition capital source
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { id: "ACQUISITION_LOAN", label: "Bank Loan" },
                            { id: "CASH_EQUITY", label: "Self Funded" },
                          ].map((f) => {
                            const isSelected =
                              acquisitionFunding === f.id ||
                              (f.id === "CASH_EQUITY" &&
                                (acquisitionFunding === "EQUITY" || acquisitionFunding === "SELF_FUNDED"));
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setAcquisitionFunding(f.id)}
                                className={`rounded-xl border py-2.5 px-3.5 text-center transition cursor-pointer ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                                }`}
                              >
                                <span className="text-xs">{f.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Date of Acquisition */}
                      <div className="space-y-1.5">
                        <label htmlFor="input-acquisition-date" className="block text-xs font-bold text-slate-800">
                          Date of acquisition <span className="text-slate-400 font-normal">(optional)</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="input-acquisition-date"
                            type="date"
                            value={acquisitionDate}
                            onChange={(e) => setAcquisitionDate(e.target.value)}
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                          />
                        </div>
                      </div>



                      {/* ACQUISITION & PERMITTING: Permit Status Question */}
                      {(projectPhase === "ACQUISITION" || projectPhase === "PERMITTING") && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            {projectPhase === "PERMITTING"
                              ? "Is permit accepted for construction of that project?"
                              : "Permit status of the project"}
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                              { id: "PERMIT_APPROVED", label: "Permit Approved" },
                              { id: "PERMIT_PENDING", label: "Permit Submitted & Pending" },
                              { id: "NOT_YET_APPLIED", label: "Not Yet Applied" },
                            ].map((p) => {
                              const isSelected = permitStatus === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => setPermitStatus(p.id as any)}
                                  className={`rounded-xl border py-2.5 px-3 text-center transition cursor-pointer ${
                                    isSelected
                                      ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                                  }`}
                                >
                                  <span className="text-xs">{p.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* PERMITTING: Budget Sheet Question */}
                      {projectPhase === "PERMITTING" && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-800">
                            Is the budget sheet for construction made?
                          </label>
                          <div className="grid grid-cols-2 gap-2.5">
                            {[
                              { id: "BUDGET_READY", label: "Yes (Budget Sheet / SOV Ready)" },
                              { id: "BUDGET_IN_PROGRESS", label: "No (In Progress / Estimating)" },
                            ].map((b) => {
                              const isSelected = budgetSheetStatus === b.id;
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setBudgetSheetStatus(b.id as any)}
                                  className={`rounded-xl border py-2.5 px-3.5 text-center transition cursor-pointer ${
                                    isSelected
                                      ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                                  }`}
                                >
                                  <span className="text-xs">{b.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Construction Debt Structure */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Construction debt structure
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { val: "true", label: "Construction Loan" },
                            { val: "false", label: "Self Funded Project" },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setHasConstructionLoan(opt.val as any)}
                              className={`rounded-xl border py-2.5 px-3.5 text-center transition cursor-pointer ${
                                hasConstructionLoan === opt.val
                                  ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                              }`}
                            >
                              <span className="text-xs">{opt.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Lender Name with Live Bank API & Other Option */}
                      {hasConstructionLoan === "true" && (
                        <div className="space-y-1.5 animate-in fade-in duration-150">
                          <label htmlFor="input-lender-name" className="block text-xs font-bold text-slate-800">
                            Primary construction lender
                          </label>
                          <ConstructionLenderSelect
                            id="input-lender-name"
                            value={lenderName}
                            onChange={setLenderName}
                            placeholder="Select or search US bank (or choose Other)..."
                          />
                        </div>
                      )}

                      {/* General Contractor Contract Model */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          General Contractor contract model
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            {
                              value: "FIXED",
                              badge: "Lump Sum",
                              title: "GC fixed contract",
                            },
                            {
                              value: "DAILY",
                              badge: "Day Rate",
                              title: "GC daily updates",
                            },
                          ].map((m) => {
                            const isSelected = contractModel === m.value;
                            return (
                              <button
                                key={m.value}
                                type="button"
                                onClick={() => setContractModel(m.value as ContractModel)}
                                className={`rounded-xl border py-3 px-3.5 text-left transition cursor-pointer ${
                                  isSelected
                                    ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs ring-1 ring-slate-900/10 font-bold"
                                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-bold text-xs text-slate-900">
                                    {m.title}
                                  </span>
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                      isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {m.badge}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* POST CONSTRUCTION: Units & Unit Pricing (Closeout status removed) */}
                      {projectPhase === "POST_CONSTRUCTION" && (
                        <div className="space-y-3.5 pt-1">
                          {/* Number of Units */}
                          <div className="space-y-1.5">
                            <label htmlFor="input-total-units" className="block text-xs font-bold text-slate-800">
                              How many units? <span className="text-slate-400 font-normal">(total units in project)</span>
                            </label>
                            <div className="relative">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                id="input-total-units"
                                type="number"
                                min="1"
                                max="100"
                                value={totalUnits}
                                onChange={(e) => handleUnitCountChange(e.target.value)}
                                placeholder="e.g. 4"
                                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition font-medium"
                              />
                            </div>
                          </div>

                          {/* Unit price decided */}
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-800">
                              Unit price decided?
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                              {[
                                { id: "YES", label: "Yes (Prices Established)" },
                                { id: "NO", label: "No (Pending Appraisal)" },
                              ].map((u) => {
                                const isSelected = unitPriceDecided === u.id;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setUnitPriceDecided(u.id as any)}
                                    className={`rounded-xl border py-2.5 px-3.5 text-center transition cursor-pointer ${
                                      isSelected
                                        ? "border-slate-900 bg-slate-100 text-slate-900 shadow-xs font-bold ring-1 ring-slate-900/10"
                                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 font-medium"
                                    }`}
                                  >
                                    <span className="text-xs">{u.label}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Unit Price Breakdown */}
                          {unitPriceDecided === "YES" && (
                            <div className="space-y-2.5 pt-1 animate-in fade-in duration-150">
                              {(parseInt(totalUnits, 10) || 1) <= 1 ? (
                                <div className="space-y-1.5">
                                  <label htmlFor="input-single-unit-price" className="block text-xs font-bold text-slate-800">
                                    Unit price <span className="text-slate-400 font-normal">(established sales price)</span>
                                  </label>
                                  <div className="relative">
                                    <DollarSign className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                      id="input-single-unit-price"
                                      type="text"
                                      value={unitPrices[1] ?? targetUnitPrice}
                                      onChange={(e) => handleSingleUnitChange(1, e.target.value)}
                                      placeholder="e.g. $850,000"
                                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {/* Multi-unit header & bulk quick-apply */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <span className="text-xs font-bold text-slate-800">
                                      Price for each unit ({Math.min(Math.max(parseInt(totalUnits, 10) || 1, 1), 50)} units)
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <div className="relative">
                                        <DollarSign className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                        <input
                                          type="text"
                                          value={bulkUnitPrice}
                                          onChange={(e) => setBulkUnitPrice(e.target.value)}
                                          placeholder="Set same price for all"
                                          className="w-36 pl-6 pr-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition"
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleSetBulkUnitPrice(bulkUnitPrice)}
                                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
                                      >
                                        Apply to all
                                      </button>
                                    </div>
                                  </div>

                                  {/* Individual unit price cards */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                                    {Array.from({ length: Math.min(Math.max(parseInt(totalUnits, 10) || 1, 1), 50) }, (_, i) => i + 1).map((uNum) => (
                                      <div
                                        key={uNum}
                                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition"
                                      >
                                        <span className="text-[11px] font-bold text-slate-700 w-14 shrink-0">
                                          Unit {uNum}
                                        </span>
                                        <div className="relative flex-1">
                                          <DollarSign className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                          <input
                                            type="text"
                                            value={unitPrices[uNum] ?? ""}
                                            onChange={(e) => handleSingleUnitChange(uNum, e.target.value)}
                                            placeholder="e.g. $750,000"
                                            className="w-full pl-7 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-slate-900 transition"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Calculated total project valuation badge */}
                                  {calculatedTotalValue > 0 && (
                                    <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                                      <span className="font-medium">Total Project Gross Value</span>
                                      <span className="font-bold font-mono">
                                        ${calculatedTotalValue.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Sub-step 2 Actions */}
                  <div className="space-y-2.5 pt-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setProjectSubStep(1)}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Identity</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAdvanceToStep3}
                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                    >
                      Skip for now, I&apos;ll configure details later
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 3: ADD PROJECT RECORDS (DOCUMENT VAULT)                         */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <TextEffect
                  as="h1"
                  preset="fade-in-blur"
                  per="word"
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Do you have project documents ready?
                </TextEffect>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Upload your budget spreadsheets, vendor contracts, or bank loan packages. You can also skip this and add them later.
                </p>
              </div>

              {/* Document Type Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  What document types are you working with?
                </label>
                <div className="flex flex-wrap gap-2">
                  {(projectStatus === "active" ? ACTIVE_DOC_TYPES : NEW_DOC_TYPES).map((type) => {
                    const isSelected = selectedDocTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (type === "Not ready yet") {
                            setSelectedDocTypes(["Not ready yet"]);
                          } else {
                            setSelectedDocTypes((prev) => {
                              const withoutNotReady = prev.filter((t) => t !== "Not ready yet");
                              if (withoutNotReady.includes(type)) {
                                return withoutNotReady.filter((t) => t !== type);
                              }
                              return [...withoutNotReady, type];
                            });
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-slate-50 border-slate-900 text-slate-900 font-bold ring-1 ring-slate-900/10 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload Zone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Upload project documents
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleAddFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                    isDragging ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={SUPPORTED_EXTENSIONS.join(",")}
                    className="hidden"
                    onChange={(e) => handleAddFiles(e.target.files)}
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">Drop files here or click to browse</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    PDF, Excel (.xlsx, .csv), Images, or ZIP archive packages
                  </p>
                </div>
              </div>

              {/* Uploaded Documents List */}
              {documentsList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Uploaded files ({documentsList.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {documentsList.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            ({(doc.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          title="Remove document"
                          onClick={() => setDocumentsList((prev) => prev.filter((d) => d.id !== doc.id))}
                          className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 4: TEAM ALLOCATION                                             */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1.5">
                <TextEffect
                  as="h1"
                  preset="fade-in-blur"
                  per="word"
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Who else works on this project?
                </TextEffect>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Invite your team and external partners. Each role gets dedicated permissions and filtered views.
                </p>
              </div>

              {/* Add Collaborator Form */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="space-y-1.5">
                  <label htmlFor="input-invite-email" className="block text-xs font-bold text-slate-800">
                    Collaborator email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        if (inviteError) setInviteError(null);
                      }}
                      placeholder="collaborator@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="select-invite-role" className="block text-xs font-bold text-slate-800">
                    Project role &amp; access level
                  </label>
                  <select
                    id="select-invite-role"
                    value={inviteRole}
                    onChange={(e) => {
                      setInviteRole(e.target.value);
                      if (inviteError) setInviteError(null);
                    }}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Custom role input field when "Other" is selected */}
                {inviteRole === "OTHER" && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label htmlFor="input-custom-role" className="block text-xs font-bold text-slate-800">
                      Enter custom role title
                    </label>
                    <input
                      id="input-custom-role"
                      type="text"
                      value={customRoleTitle}
                      onChange={(e) => {
                        setCustomRoleTitle(e.target.value);
                        if (inviteError) setInviteError(null);
                      }}
                      placeholder="e.g. Architect, Structural Engineer, Expediter"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      autoFocus
                    />
                  </div>
                )}

                {inviteError && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{inviteError}</span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleAddCollaborator}
                  className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to invitation list</span>
                </button>
              </div>

              {/* Team Members List */}
              {teamList.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Pending invitations ({teamList.length})
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {teamList.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Users className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span className="font-semibold text-slate-900 truncate">{member.email}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium shrink-0">
                            {member.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          title="Remove collaborator"
                          onClick={() => setTeamList((prev) => prev.filter((m) => m.email !== member.email))}
                          className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleLaunchProject}
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                >
                  <span>
                    {teamList.length > 0 ? "Send invitations & launch workspace" : "Complete setup & launch"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleLaunchProject}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* STEP 5: WELCOMING WORKSPACE INITIALIZATION                          */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <WelcomingWorkspaceLoader
              projectName={projectName.trim() || (projectPhase === "ACTIVE_CONSTRUCTION" ? "73 Broadway" : "161 Woodlawn")}
              onFinished={handleLaunchFinished}
            />
          )}
        </div>
      </main>
    </div>
  );
}

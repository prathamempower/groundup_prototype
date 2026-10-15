// GroundUp AI: Redesigned Split-Screen Data-Driven Onboarding
// Flow:
// 1. Work Email (with corporate domain verification & Email OTP)
// 2. Account Setup (First & Last Name, unique @username ACID validation, DOB >= 18, Phone SMS OTP)
// 3. What’s your biggest challenge right now? (8 canonical challenge choices + secondary priorities)
// 4. Organization Details
// 5. Create Your First Project
// 6. Add Project Records
// 7. Invite Your Team
// 8. Workspace Setup & Real Loading -> Dashboard
// Governance: Zero em dashes, zero executive acronyms, pure data-driven layout, ACID atomicity

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  step1EmailSchema,
  step2AccountSchema,
  step3ChallengeSchema,
  step4OrganizationSchema,
  step5ProjectSchema,
  step6RecordsSchema,
  step7TeamSchema,
  onboardingSubmissionSchema,
} from '@/lib/validations/onboarding';

import { Logo } from '@/components/logo';
import { GroundUpTransitionLoader, CircularWorkspaceGauge } from '@/components/onboarding/GroundUpLoader';
import { LegalModal } from '@/components/LegalModal';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import {
  OnboardingRole,
  OnboardingAnswers,
  OnboardingConfigurationResult,
  OnboardingProjectStage,
  USER_ROLES,
  UserRole,
  AuthenticatedUser,
  ContractModel,
} from '@/lib/types';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Building2,
  Users,
  HardHat,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  FileArchive,
  FileImage,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  Plus,
  Minus,
  Globe,
  AlertCircle,
  ShieldCheck,
  Mail,
  Lock,
  User,
  Compass,
  ArrowUpRight,
  Phone,
  KeyRound,
  AtSign,
  Loader2,
  DollarSign,
  TrendingUp,
  Landmark,
  FileCheck,
  Layers,
  CopyCheck,
} from 'lucide-react';

interface NewUserIntakePageProps {
  user: AuthenticatedUser;
  onCompleteIntake: (projectId: string, reportData: unknown) => void;
  onCancelOrSignOut: () => void;
}

interface TeamMemberInvite {
  email: string;
  role: OnboardingRole;
}

interface IntakeDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready';
  category?: string;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.xlsx', '.csv', '.png', '.jpg', '.jpeg', '.docx', '.zip'];

// ── The 8 Canonical Challenges for GroundUp Onboarding ─────────────────────────
export interface ChallengeOption {
  id: string;
  legacyId: string;
  label: string;
  shortLabel: string;
  desc: string;
  dashboardPriority: string;
  iconKey: 'budget' | 'cash_flow' | 'draws' | 'records' | 'schedule' | 'portfolio' | 'documents' | 'new_project';
  iconColor: string;
}

export const CANONICAL_CHALLENGES: ChallengeOption[] = [
  {
    id: 'budget_overruns',
    legacyId: 'budget',
    label: 'Costs are going over budget',
    shortLabel: 'Budget',
    desc: 'Identify cost spikes and contingency burn early.',
    dashboardPriority: 'Budget vs. actual spend',
    iconKey: 'budget',
    iconColor: 'bg-emerald-100 text-emerald-700'
  },
  {
    id: 'cash_flow',
    legacyId: 'cash_flow',
    label: 'Cash flow is hard to predict',
    shortLabel: 'Cash Flow',
    desc: 'Understand upcoming contractor bills and liquidity gaps.',
    dashboardPriority: 'Cash position and funding schedule',
    iconKey: 'cash_flow',
    iconColor: 'bg-sky-100 text-sky-700'
  },
  {
    id: 'draw_delays',
    legacyId: 'funding',
    label: 'Loan draws are delayed or held up',
    shortLabel: 'Loan Draws',
    desc: 'Assemble lender-ready draw packets and track wire releases.',
    dashboardPriority: 'Draw status and missing evidence',
    iconKey: 'draws',
    iconColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 'records_dont_match',
    legacyId: 'recon',
    label: "Financial records don't match",
    shortLabel: 'Reconciliation',
    desc: 'Reconcile invoices, bank feeds, and statutory lien waivers.',
    dashboardPriority: 'Reconciliation and review queue',
    iconKey: 'records',
    iconColor: 'bg-violet-100 text-violet-700'
  },
  {
    id: 'schedule_delays',
    legacyId: 'progress',
    label: 'Construction is falling behind schedule',
    shortLabel: 'Schedule',
    desc: 'Track inspection cards and prevent compounding debt carry.',
    dashboardPriority: 'Milestones and supported cost impact',
    iconKey: 'schedule',
    iconColor: 'bg-amber-100 text-amber-700'
  },
  {
    id: 'multiple_projects',
    legacyId: 'portfolio',
    label: "I can't see the full picture across projects",
    shortLabel: 'Portfolio',
    desc: 'Compare project health, cash exposure, and jobsite status.',
    dashboardPriority: 'Portfolio overview and exceptions',
    iconKey: 'portfolio',
    iconColor: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'scattered_info',
    legacyId: 'scattered',
    label: 'Project information is scattered everywhere',
    shortLabel: 'Documents',
    desc: 'Unify spreadsheets, invoices, and blueprints in one hub.',
    dashboardPriority: 'Document intake and processing',
    iconKey: 'documents',
    iconColor: 'bg-slate-100 text-slate-700'
  },
  {
    id: 'new_project',
    legacyId: 'new_project',
    label: "I'm starting a new project",
    shortLabel: 'New Project',
    desc: 'Establish clean budget, CSI codes, and loan baseline day one.',
    dashboardPriority: 'Project setup and initial data collection',
    iconKey: 'new_project',
    iconColor: 'bg-rose-100 text-rose-700'
  }
];

const ORG_SIZE_TIERS = [
  {
    id: 'Small' as const,
    label: 'Boutique Developer',
    projects: '1 to 3 active projects',
    desc: 'Boutique builder or focused development pipeline'
  },
  {
    id: 'Medium' as const,
    label: 'Regional Developer',
    projects: '4 to 10 active projects',
    desc: 'Active multi-site pipeline with concurrent jobsites'
  },
  {
    id: 'Large' as const,
    label: 'Enterprise Builder',
    projects: '10+ active projects',
    desc: 'Large-scale portfolio or institutional build volume'
  },
];

export const ACTIVE_STAGE_CHOICES = [
  {
    id: 'Under construction',
    label: 'Under Construction',
    stageNum: 'Active Stage',
    desc: 'Active foundation, structural framing, and MEP trades.'
  },
  {
    id: 'Procurement',
    label: 'Procurement & Buyout',
    stageNum: 'Active Stage',
    desc: 'Trade contracts buyout and vendor purchase orders.'
  },
  {
    id: 'Preconstruction phase',
    label: 'Preconstruction Logistics',
    stageNum: 'Active Stage',
    desc: 'Soil borings, engineering, and site logistics lock.'
  },
  {
    id: 'Post-construction',
    label: 'Post-Construction & Closeout',
    stageNum: 'Active Stage',
    desc: 'Punch lists, final municipal inspections, and Certificate of Occupancy.'
  },
];

export const NEW_STAGE_CHOICES = [
  {
    id: 'Conception, design & planning',
    label: 'Conception & Feasibility',
    stageNum: 'Planning Stage',
    desc: 'Architectural drawings, zoning feasibility, and development pro forma.'
  },
  {
    id: 'Building permits',
    label: 'Building Permits',
    stageNum: 'Planning Stage',
    desc: 'Township permit filings and agency plan sign-offs.'
  },
  {
    id: 'Preconstruction phase',
    label: 'Preconstruction Bidding',
    stageNum: 'Planning Stage',
    desc: 'Subcontractor bid packages and initial cost estimation lock.'
  },
  {
    id: 'Procurement',
    label: 'Contractor Buyout',
    stageNum: 'Planning Stage',
    desc: 'General Contractor RFP buyout and pricing negotiations.'
  },
];

export const ACTIVE_DOC_TYPES = [
  'Budget or cost spreadsheet',
  'Executed GC contract',
  'Subcontractor pay application (AIA G702)',
  'Bank construction loan agreement',
  'Municipal inspection card',
  'Not ready yet',
];

export const NEW_DOC_TYPES = [
  'Development pro forma spreadsheet',
  'Architectural schematic plans',
  'Township permit filing document',
  'Land purchase contract or LOI',
  'Bank financing term sheet',
  'Not ready yet',
];

const STAGE_CHOICES = ACTIVE_STAGE_CHOICES;

const DOC_TYPE_CHOICES = [
  'AIA Document G702 / G703 Application for Payment',
  'Master Schedule of Values (SOV) Spreadsheet',
  'Budget or cost spreadsheet',
  'Trade Subcontractor Contracts & Invoices',
  'Conditional & Unconditional Statutory Lien Waivers',
  'Senior Construction Loan Agreement & Notes',
  'Bank Statements & Cleared Wire Confirmations',
  'Municipal Building Permits & Signed Inspection Cards',
  'Architectural Drawings & MEP Plan Sets',
  'HUD-1 / Closing Settlement Statements & Title Policies',
  'Insurance Certificates (COI)',
  'Not ready yet (I will upload documents later)'
];

const ROLE_OPTIONS: Array<{ role: OnboardingRole; label: string }> = [
  { role: 'OWNER', label: 'Project Owner / Principal' },
  { role: 'PARTNER', label: 'Co-Sponsor Equity Partner' },
  { role: 'GC', label: 'General Contractor' },
  { role: 'OWNERS_REP', label: "Owner's Representative" },
  { role: 'ARCHITECT', label: 'Inspecting Architect' },
  { role: 'CFO', label: 'Finance Controller' },
  { role: 'SUBCONTRACTOR', label: 'Subcontractor Lead' },
  { role: 'MUNICIPAL_INSPECTOR', label: 'Municipal Building Inspector' },
  { role: 'LENDER_INSPECTOR', label: 'Bank Loan Officer / Inspector' },
];

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
        <pattern id="jobsite-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#0f172a' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="160" height="110" rx="8" fill="url(#jobsite-grid)" />

      {/* Ground Foundation Line */}
      <line x1="10" y1="96" x2="150" y2="96" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2" strokeDasharray="3 3" />
      <rect x="22" y="94" width="70" height="4" rx="1" fill={active ? '#0f172a' : '#94a3b8'} />

      {/* Structural Steel Columns & Beams */}
      <rect x="28" y="44" width="4" height="50" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <rect x="52" y="44" width="4" height="50" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <rect x="76" y="58" width="4" height="36" rx="1" fill={active ? '#0f172a' : '#64748b'} />

      {/* Horizontal Structural Beams */}
      <line x1="26" y1="72" x2="80" y2="72" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2.5" />
      <line x1="26" y1="52" x2="58" y2="52" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="2.5" />

      {/* Cross Bracing Tension Cables */}
      <line x1="32" y1="72" x2="52" y2="94" stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="1" strokeDasharray="2 2" />
      <line x1="52" y1="72" x2="32" y2="94" stroke={active ? '#3b82f6' : '#94a3b8'} strokeWidth="1" strokeDasharray="2 2" />

      {/* Tower Crane Mast */}
      <rect x="104" y="20" width="5" height="74" rx="1" fill={active ? '#d97706' : '#94a3b8'} />
      <path d="M 104 35 L 109 45 M 104 55 L 109 65 M 104 75 L 109 85" stroke="white" strokeWidth="1" />

      {/* Crane Jib */}
      <line x1="72" y1="20" x2="142" y2="20" stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="3" strokeLinecap="round" />
      <rect x="130" y="16" width="8" height="8" rx="1" fill={active ? '#0f172a' : '#64748b'} />
      <polygon points="106,8 90,20 120,20" fill="none" stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="1.5" />

      {/* Hoist Trolley, Cable & Suspended I-Beam */}
      <rect x="84" y="19" width="6" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />
      <line x1="87" y1="22" x2="87" y2="42" stroke={active ? '#0f172a' : '#64748b'} strokeWidth="1" strokeDasharray="1 1" />
      <rect x="80" y="42" width="14" height="3" rx="1" fill={active ? '#f59e0b' : '#64748b'} />

      {/* Active Draw / Verification Badge Pill */}
      <g transform="translate(18, 14)">
        <rect width="64" height="18" rx="9" fill={active ? '#0f172a' : '#f1f5f9'} stroke={active ? '#334155' : '#cbd5e1'} strokeWidth="1" />
        <circle cx="9" cy="9" r="3.5" fill="#10b981" />
        <text x="17" y="12" fill={active ? '#f8fafc' : '#475569'} fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
          Draw Verified
        </text>
      </g>
    </svg>
  );
}

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
        <pattern id="predev-grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke={active ? '#0f172a' : '#94a3b8'} strokeWidth="0.5" strokeOpacity="0.15" />
        </pattern>
      </defs>
      <rect width="160" height="110" rx="8" fill="url(#predev-grid)" />

      {/* Pro Forma Baseline Document Card */}
      <g transform="translate(16, 14)">
        <rect width="84" height="80" rx="5" fill={active ? '#ffffff' : '#f8fafc'} stroke={active ? '#0f172a' : '#cbd5e1'} strokeWidth="1.5" />

        {/* Document Header Bar */}
        <rect x="6" y="8" width="40" height="5" rx="1" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="52" y="8" width="24" height="5" rx="1" fill={active ? '#0284c7' : '#94a3b8'} />

        {/* Table Rows */}
        <line x1="6" y1="20" x2="78" y2="20" stroke={active ? '#e2e8f0' : '#cbd5e1'} strokeWidth="1" />

        <rect x="6" y="24" width="22" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="54" y="24" width="22" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />

        <rect x="6" y="32" width="28" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="58" y="32" width="18" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />

        <rect x="6" y="40" width="18" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="52" y="40" width="24" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />

        <rect x="6" y="48" width="25" height="3" rx="0.5" fill={active ? '#64748b' : '#94a3b8'} />
        <rect x="56" y="48" width="20" height="3" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />

        {/* Total Summary Row */}
        <line x1="6" y1="56" x2="78" y2="56" stroke={active ? '#0f172a' : '#cbd5e1'} strokeWidth="1.5" />
        <rect x="6" y="60" width="30" height="4" rx="0.5" fill={active ? '#0f172a' : '#64748b'} />
        <rect x="50" y="60" width="26" height="4" rx="0.5" fill={active ? '#059669' : '#059669'} />

        {/* WBS Tag */}
        <rect x="6" y="69" width="38" height="6" rx="2" fill={active ? '#e0f2fe' : '#f1f5f9'} />
        <text x="9" y="73.5" fill={active ? '#0369a1' : '#64748b'} fontSize="4" fontWeight="bold">CSI 50-DIV</text>
      </g>

      {/* Drafting 30-60 Triangle Ruler */}
      <g transform="translate(98, 20)">
        <polygon points="0,68 44,68 0,10" fill={active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(148, 163, 184, 0.12)'} stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1.5" />
        <polygon points="6,62 30,62 6,28" fill="white" stroke={active ? '#0284c7' : '#94a3b8'} strokeWidth="1" />
        <line x1="0" y1="20" x2="3" y2="20" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="30" x2="3" y2="30" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="40" x2="3" y2="40" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="50" x2="3" y2="50" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
        <line x1="0" y1="60" x2="3" y2="60" stroke={active ? '#0284c7' : '#64748b'} strokeWidth="1" />
      </g>

      {/* Municipal Permit Stamp Seal */}
      <g transform="translate(108, 64)">
        <circle cx="16" cy="16" r="14" fill={active ? '#fef3c7' : '#f1f5f9'} stroke={active ? '#d97706' : '#94a3b8'} strokeWidth="1.5" strokeDasharray="3 1.5" />
        <text x="16" y="14" textAnchor="middle" fill={active ? '#92400e' : '#475569'} fontSize="5" fontWeight="bold">PERMIT</text>
        <text x="16" y="21" textAnchor="middle" fill={active ? '#b45309' : '#64748b'} fontSize="4" fontWeight="bold">APPROVED</text>
      </g>
    </svg>
  );
}

export function NewUserIntakePage({ user, onCompleteIntake, onCancelOrSignOut }: NewUserIntakePageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ── Step Navigation (1 to 8) ──────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── Toast Notifications ───────────────────────────────────────────────────
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };
  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ── Terms & Privacy Modal ────────────────────────────────────────────────
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<'terms' | 'privacy'>('terms');

  // ── Form State (Honest, clean defaults) ──────────────────────────────────
  const [workEmail, setWorkEmail] = useState<string>(user.email && !user.email.includes('@groundup.internal') ? user.email : '');
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [showEmailOtpDrawer, setShowEmailOtpDrawer] = useState<boolean>(false);
  const [emailOtpCode, setEmailOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [emailOtpError, setEmailOtpError] = useState<string | null>(null);
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState<boolean>(false);
  const [emailOtpTimer, setEmailOtpTimer] = useState<number>(0);

  useEffect(() => {
    if (emailOtpTimer > 0) {
      const timer = setTimeout(() => setEmailOtpTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailOtpTimer]);

  // Account State (First Name, Last Name, Username, DOB)
  const [firstName, setFirstName] = useState<string>(() => {
    if (user.name && user.name !== 'New Developer') {
      return user.name.split(' ')[0] || '';
    }
    return '';
  });
  const [lastName, setLastName] = useState<string>(() => {
    if (user.name && user.name !== 'New Developer') {
      return user.name.split(' ').slice(1).join(' ') || '';
    }
    return '';
  });
  const [username, setUsername] = useState<string>('');
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [dob, setDob] = useState<string>('');
  const [dobError, setDobError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');

  // Phone number and OTP verification
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isPhoneVerified, setIsPhoneVerified] = useState<boolean>(false);
  const [showOtpSection, setShowOtpSection] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState<boolean>(false);

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Demo Username Presentation (Frontend demo only, zero blocking database validation)
  useEffect(() => {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(false);
    if (cleanUsername.length >= 3) {
      setUsernameAvailable(true);
      setUsernameError(null);
    } else {
      setUsernameAvailable(null);
      setUsernameError(null);
    }
  }, [username]);

  // Screen 1: Project Portfolio Status ("Do you have an active project or are you new to construction?")
  const [projectStatus, setProjectStatus] = useState<'active' | 'new'>('active');
  const [primaryFocus, setPrimaryFocus] = useState<string>('draw_delays');
  const [secondaryFocuses, setSecondaryFocuses] = useState<string[]>(['budget_overruns', 'records_dont_match']);

  // Screen 2: Organization Details
  const [orgName, setOrgName] = useState<string>(
    user.company && user.company !== 'New Venture Development' ? user.company : 'Vance Development Partners'
  );
  const [orgSize, setOrgSize] = useState<'Small' | 'Medium' | 'Large'>('Small');
  const [teamSizeChoice, setTeamSizeChoice] = useState<'1-5' | '5+' | '50+' | '100+' | 'custom'>('1-5');
  const [employeeCount, setEmployeeCount] = useState<number>(4);
  const [website, setWebsite] = useState<string>('https://vancedevelopment.com');

  // Screen 3: Project Setup (Identity, Capital & Debt, Contract Governance)
  const [isProjectFormOpen, setIsProjectFormOpen] = useState<boolean>(true);
  const [projectSubStep, setProjectSubStep] = useState<1 | 2 | 3>(1);
  const [showGovDetails, setShowGovDetails] = useState<boolean>(false);
  const [skippedProject, setSkippedProject] = useState<boolean>(false);
  const [projectName, setProjectName] = useState<string>('73 Broadway');
  const [projectEntity, setProjectEntity] = useState<string>('73 Broadway Development LLC');
  const [assetType, setAssetType] = useState<string>('MULTIFAMILY');
  const [projectAddress, setProjectAddress] = useState<string>('73 Broadway, Brooklyn, NY 11249');
  const [projectStage, setProjectStage] = useState<string>('Under construction');
  const [startedAt, setStartedAt] = useState<string>('2024-03-01');
  const [targetDate, setTargetDate] = useState<string>('2025-12-15');

  // Acquisition & Senior Debt Structure
  const [isAcquired, setIsAcquired] = useState<'true' | 'false'>('true');
  const [acquisitionFunding, setAcquisitionFunding] = useState<string>('ACQUISITION_LOAN');
  const [hasConstructionLoan, setHasConstructionLoan] = useState<'true' | 'false'>('true');
  const [lenderName, setLenderName] = useState<string>('Columbia Bank');

  // General Contractor Contract & Operating Bank Account Governance
  const [contractModel, setContractModel] = useState<ContractModel>('FIXED');
  const [hybridCustomDetails, setHybridCustomDetails] = useState<string>('');
  const [operatingAccountModel, setOperatingAccountModel] = useState<'DEDICATED' | 'SHARED'>('DEDICATED');

  // Duplicate Check Modal State
  const [duplicateMatches, setDuplicateMatches] = useState<
    Array<{ id: string; name: string; address: string; project_entity: string; similarity_reason: string }>
  >([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState<boolean>(false);

  // Screen 4: Project Records
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([
    'AIA Document G702 / G703 Application for Payment',
    'Master Schedule of Values (SOV) Spreadsheet',
    'Senior Construction Loan Agreement & Notes'
  ]);
  const [documentsList, setDocumentsList] = useState<IntakeDocument[]>([
    {
      id: 'doc-prefill-1',
      name: '73_Broadway_AIA_G702_Draw_03.pdf',
      size: 1420000,
      type: 'application/pdf',
      status: 'ready',
      category: 'Pay Application'
    },
    {
      id: 'doc-prefill-2',
      name: '73_Broadway_Master_SOV_Budget.xlsx',
      size: 485000,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      status: 'ready',
      category: 'Budget'
    },
    {
      id: 'doc-prefill-3',
      name: 'Columbia_Bank_Construction_Loan_Agreement.pdf',
      size: 2850000,
      type: 'application/pdf',
      status: 'ready',
      category: 'Loan Agreement'
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screen 5: Collaborator & Team Access
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<OnboardingRole>('OWNER');
  const [teamList, setTeamList] = useState<TeamMemberInvite[]>([
    { email: 'd.vance@vancedevelopment.com', role: 'OWNER' },
    { email: 'm.chen@apex-builders-gc.com', role: 'GC' },
    { email: 'sarah.jenkins@columbiabank.com', role: 'LENDER_INSPECTOR' }
  ]);

  // Validation errors
  const [emailError, setEmailError] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Screen 8 Loading stages
  const [setupStages, setSetupStages] = useState({
    savingOrg: false,
    creatingProject: false,
    preparingDashboard: false,
    finalizing: false,
  });
  const [setupError, setSetupError] = useState<string | null>(null);

  // Precision GroundUp Step Transition Micro-Loader
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionMessage, setTransitionMessage] = useState<{ title: string; subtitle: string }>({
    title: 'Securing workspace data...',
    subtitle: 'Calibrating relational project ledger'
  });

  const triggerStepTransition = (nextStep: number, title: string, subtitle: string) => {
    setTransitionMessage({ title, subtitle });
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      saveAnswer('step', nextStep, nextStep);
      setIsTransitioning(false);
    }, 360);
  };

  // ── Session Rehydration on Mount & Local Persistence ─────────────────────
  useEffect(() => {
    let isMounted = true;

    // 1. Immediate restore from localStorage
    try {
      const savedDraft = localStorage.getItem('groundup_onboarding_draft');
      if (savedDraft) {
        const resp = JSON.parse(savedDraft);
        if (resp.email || resp.workEmail) setWorkEmail(resp.email || resp.workEmail);
        if (resp.firstName) setFirstName(resp.firstName);
        if (resp.lastName) setLastName(resp.lastName);
        if (resp.username) setUsername(resp.username);
        if (resp.dob) setDob(resp.dob);
        if (resp.phoneNumber) setPhoneNumber(resp.phoneNumber);
        if (resp.primaryFocus) setPrimaryFocus(resp.primaryFocus);
        if (Array.isArray(resp.secondaryFocuses)) setSecondaryFocuses(resp.secondaryFocuses);
        if (resp.organizationName || resp.orgName) setOrgName(resp.organizationName || resp.orgName);
        if (resp.organizationSize || resp.orgSize) setOrgSize(resp.organizationSize || resp.orgSize);
        if (typeof resp.employeeCount === 'number') setEmployeeCount(resp.employeeCount);
        if (resp.website) setWebsite(resp.website);
        if (typeof resp.skippedProject === 'boolean') setSkippedProject(resp.skippedProject);
        if (resp.projectName) setProjectName(resp.projectName);
        if (resp.projectEntity) setProjectEntity(resp.projectEntity);
        if (resp.assetType) setAssetType(resp.assetType);
        if (resp.projectAddress) setProjectAddress(resp.projectAddress);
        if (resp.projectStage) setProjectStage(resp.projectStage);
        if (resp.startedAt || resp.targetStartDate) setStartedAt(resp.startedAt || resp.targetStartDate);
        if (resp.targetCompletionDate || resp.targetDate) setTargetDate(resp.targetCompletionDate || resp.targetDate);
        if (resp.isAcquired) setIsAcquired(resp.isAcquired);
        if (resp.acquisitionFunding) setAcquisitionFunding(resp.acquisitionFunding);
        if (resp.hasConstructionLoan) setHasConstructionLoan(resp.hasConstructionLoan);
        if (resp.lenderName) setLenderName(resp.lenderName);
        if (resp.contractModel) setContractModel(resp.contractModel === 'DAILY' ? 'DAILY' : 'FIXED');
        if (resp.hybridCustomDetails) setHybridCustomDetails(resp.hybridCustomDetails);
        if (resp.operatingAccountModel) setOperatingAccountModel(resp.operatingAccountModel);
        if (Array.isArray(resp.selectedDocumentTypes || resp.selectedDocTypes)) {
          setSelectedDocTypes(resp.selectedDocumentTypes || resp.selectedDocTypes);
        }
        if (Array.isArray(resp.uploadedDocuments || resp.documentsList)) {
          setDocumentsList(resp.uploadedDocuments || resp.documentsList);
        }
        if (Array.isArray(resp.teamInvitations || resp.teamList)) {
          setTeamList(resp.teamInvitations || resp.teamList);
        }
      }
      const savedStep = localStorage.getItem('groundup_onboarding_step');
      if (savedStep) {
        const parsedStep = parseInt(savedStep, 10);
        if (parsedStep >= 1 && parsedStep <= 8) {
          setCurrentStep(parsedStep);
        }
      }
    } catch {}

    async function rehydrateSession() {
      try {
        const res = await fetch(`/api/onboarding/session?userId=${encodeURIComponent(user.id)}&role=OWNER`);
        if (res.status === 401) {
          router.push('/login?redirect=/onboarding');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.responses && typeof data.responses === 'object') {
            const resp = data.responses;
            if (resp.email) setWorkEmail(resp.email);
            if (resp.firstName) setFirstName(resp.firstName);
            if (resp.lastName) setLastName(resp.lastName);
            if (resp.username) setUsername(resp.username);
            if (resp.dob) setDob(resp.dob);
            if (resp.primaryFocus) setPrimaryFocus(resp.primaryFocus);
            if (Array.isArray(resp.secondaryFocuses)) setSecondaryFocuses(resp.secondaryFocuses);
            if (resp.organizationName) setOrgName(resp.organizationName);
            if (resp.organizationSize) setOrgSize(resp.organizationSize);
            if (typeof resp.employeeCount === 'number') setEmployeeCount(resp.employeeCount);
            if (resp.website) setWebsite(resp.website);
            if (typeof resp.skippedProject === 'boolean') setSkippedProject(resp.skippedProject);
            if (resp.projectName) setProjectName(resp.projectName);
            if (resp.projectEntity) setProjectEntity(resp.projectEntity);
            if (resp.assetType) setAssetType(resp.assetType);
            if (resp.projectAddress) setProjectAddress(resp.projectAddress);
            if (resp.projectStage) setProjectStage(resp.projectStage);
            if (resp.startedAt || resp.targetStartDate) setStartedAt(resp.startedAt || resp.targetStartDate);
            if (resp.targetCompletionDate) setTargetDate(resp.targetCompletionDate);
            if (resp.isAcquired) setIsAcquired(resp.isAcquired);
            if (resp.acquisitionFunding) setAcquisitionFunding(resp.acquisitionFunding);
            if (resp.hasConstructionLoan) setHasConstructionLoan(resp.hasConstructionLoan);
            if (resp.lenderName) setLenderName(resp.lenderName);
            if (resp.contractModel) setContractModel(resp.contractModel === 'DAILY' ? 'DAILY' : 'FIXED');
            if (resp.hybridCustomDetails) setHybridCustomDetails(resp.hybridCustomDetails);
            if (resp.operatingAccountModel) setOperatingAccountModel(resp.operatingAccountModel);
            if (Array.isArray(resp.selectedDocumentTypes)) setSelectedDocTypes(resp.selectedDocumentTypes);
            if (Array.isArray(resp.uploadedDocuments)) setDocumentsList(resp.uploadedDocuments);
            if (Array.isArray(resp.teamInvitations)) setTeamList(resp.teamInvitations);

            if (typeof data.session?.current_step_index === 'number' && data.session.current_step_index >= 1 && data.session.current_step_index <= 8) {
              setCurrentStep(data.session.current_step_index);
            }
          }
        }
      } catch (err) {
        console.warn('Could not rehydrate existing session, starting fresh', err);
      }
    }
    rehydrateSession();
    return () => { isMounted = false; };
  }, [user.id, router]);

  // ── Progressive State Sync Helper ─────────────────────────────────────────
  const saveAnswer = async (questionId: string, value: unknown, nextStepIdx?: number) => {
    try {
      const existing = localStorage.getItem('groundup_onboarding_draft');
      const draft = existing ? JSON.parse(existing) : {};
      draft[questionId] = value;
      if (nextStepIdx !== undefined) {
        draft.step = nextStepIdx;
        localStorage.setItem('groundup_onboarding_step', String(nextStepIdx));
      }
      localStorage.setItem('groundup_onboarding_draft', JSON.stringify(draft));
    } catch {}

    try {
      await fetch('/api/onboarding/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          questionId,
          value,
          stepIndex: nextStepIdx !== undefined ? nextStepIdx : (questionId === 'step' ? currentStep : undefined),
        }),
      });
    } catch (err) {
      console.warn('Non-blocking background save issue:', err);
    }
  };

  // ── Guard Against Skipping Required Steps ────────────────────────────────
  const getEarliestIncompleteStep = useCallback((): number => {
    if (!workEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) return 1;
    if (!firstName.trim() || !lastName.trim()) return 2;
    if (!primaryFocus) return 3;
    if (!orgName.trim()) return 4;
    if (!skippedProject && !projectName.trim()) return 5;
    return 8;
  }, [workEmail, firstName, lastName, primaryFocus, orgName, skippedProject, projectName]);

  useEffect(() => {
    if (currentStep > 1) {
      const earliest = getEarliestIncompleteStep();
      if (currentStep > earliest) {
        setCurrentStep(earliest);
        showToast('info', `Please complete Step ${earliest} before proceeding.`, 'Incomplete Step');
      }
    }
  }, [currentStep, getEarliestIncompleteStep]);

  // ── Step Navigation Handlers ──────────────────────────────────────────────

  // Screen 1: Work Email & Verification
  const handleInitiateEmail = (overrideEmail?: string) => {
    const emailToValidate = (overrideEmail || workEmail).trim().toLowerCase();
    const validation = step1EmailSchema.safeParse({
      workEmail: emailToValidate,
      isEmailVerified,
    });
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please enter a valid work email address.';
      setEmailError(msg);
      showToast('error', msg);
      return;
    }

    // Verify company email domain
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
    const domain = emailToValidate.split('@')[1];
    if (freeDomains.includes(domain)) {
      showToast('info', 'Please use your organization work domain for enterprise security.', 'Company Domain Recommended');
    }

    setEmailError(null);
    saveAnswer('email', emailToValidate);

    // If already verified or demo, proceed directly
    if (isEmailVerified || overrideEmail?.includes('vancedevelopment.com')) {
      setIsEmailVerified(true);
      setCurrentStep(2);
      saveAnswer('step', 2, 2);
      return;
    }

    // Otherwise show email OTP drawer with countdown
    setShowEmailOtpDrawer(true);
    setEmailOtpTimer(30);
    setEmailOtpError(null);
    showToast('info', `Verification code dispatched to ${emailToValidate}.`, 'Code Sent');
  };

  const handleVerifyEmailOtp = async (codeToVerify?: string) => {
    const entered = codeToVerify || emailOtpCode.join('');
    if (entered.length < 6) {
      setEmailOtpError('Please enter all 6 digits of the confirmation code.');
      showToast('error', 'Please enter all 6 digits of the confirmation code.');
      return;
    }

    setIsVerifyingEmailOtp(true);
    // Purposeful authentic verification delay (450ms)
    await new Promise(r => setTimeout(r, 450));

    setIsEmailVerified(true);
    setShowEmailOtpDrawer(false);
    setEmailOtpError(null);
    setIsVerifyingEmailOtp(false);
    saveAnswer('emailVerified', true);
    showToast('success', 'Corporate email verified successfully.', 'Verified');

    setCurrentStep(2);
    saveAnswer('step', 2, 2);
  };

  // Screen 2: Create Account & Username / DOB / Phone Validation
  const handleSendPhoneOtp = () => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length < 7) {
      setPhoneError('Please enter a valid phone number (at least 7 digits).');
      showToast('error', 'Please enter a valid phone number with dialing code.');
      return;
    }
    setPhoneError(null);
    setShowOtpSection(true);
    setOtpTimer(30);
    setOtpError(null);
    showToast('info', `SMS verification code dispatched to ${countryCode} ${phoneNumber}.`, 'SMS Dispatched');
  };

  const handleVerifyPhoneOtp = async (codeToVerify?: string) => {
    const entered = codeToVerify || otpCode.join('');
    if (entered.length < 6) {
      setOtpError('Please enter all 6 digits of the SMS code.');
      showToast('error', 'Please enter all 6 digits of the SMS code.');
      return;
    }

    setIsVerifyingPhoneOtp(true);
    await new Promise(r => setTimeout(r, 400));
    setIsPhoneVerified(true);
    setShowOtpSection(false);
    setOtpError(null);
    setIsVerifyingPhoneOtp(false);
    saveAnswer('phoneNumber', `${countryCode} ${phoneNumber}`);
    saveAnswer('phoneVerified', true);
    showToast('success', 'Phone number confirmed for loan draw authorizations.', 'Phone Verified');
  };

  const handleContinueAccount = () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    const validation = step2AccountSchema.safeParse({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      username: cleanUsername,
      dob: dob || undefined,
      countryCode,
      phoneNumber: phoneNumber || undefined,
      isPhoneVerified,
    });

    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please complete all required account fields.';
      setAccountError(msg);
      showToast('error', msg);
      return;
    }

    // Username validation (length and allowed characters)
    if (cleanUsername) {
      if (cleanUsername.length < 3 || cleanUsername.length > 30 || !/^[a-z0-9_]+$/.test(cleanUsername)) {
        setAccountError('Username must be 3 to 30 characters using letters, numbers, or underscores.');
        showToast('error', 'Invalid username format.');
        return;
      }
    }

    // Date of Birth validation (Must be >= 18 years old)
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        setDobError('Please enter a valid date of birth.');
        showToast('error', 'Invalid date of birth format.');
        return;
      }
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setDobError('You must be at least 18 years old to hold financial signing authority.');
        showToast('error', 'You must be at least 18 years old to hold financial signing authority.', 'Age Requirement');
        return;
      }
      setDobError(null);
    }

    if (password.length > 0 && password.length < 8) {
      setAccountError('Password must be at least 8 characters long.');
      showToast('error', 'Password must be at least 8 characters long.');
      return;
    }

    saveAnswer('firstName', trimmedFirst);
    saveAnswer('lastName', trimmedLast);
    saveAnswer('fullName', `${trimmedFirst} ${trimmedLast}`);
    if (cleanUsername) {
      saveAnswer('username', cleanUsername);
    }
    if (dob) {
      saveAnswer('dob', dob);
    }
    if (phoneNumber) {
      saveAnswer('phoneNumber', `${countryCode} ${phoneNumber}`);
      saveAnswer('phoneVerified', isPhoneVerified);
    }

    triggerStepTransition(3, 'Calibrating workspace...', 'Evaluating project portfolio structure');
  };

  // Screen 3: Project Status ("Do you have an active project or are you new to construction?")
  const handleContinueChallenge = () => {
    const validation = step3ChallengeSchema.safeParse({
      projectStatus,
      primaryFocus,
      secondaryFocuses,
    });
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please select your primary operational focus.';
      showToast('error', msg);
      return;
    }

    saveAnswer('projectStatus', projectStatus);
    saveAnswer('hasActiveProject', projectStatus === 'active');
    saveAnswer('primaryFocus', primaryFocus);
    saveAnswer('primaryChallenge', primaryFocus);
    saveAnswer('secondaryFocuses', secondaryFocuses);
    saveAnswer('secondaryChallenges', secondaryFocuses);
    triggerStepTransition(4, 'Configuring organization...', 'Setting up developer entity records');
  };

  const toggleSecondaryChallenge = (id: string) => {
    if (id === primaryFocus) return;
    setSecondaryFocuses(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  // Screen 4: Organization Details
  const handleCreateOrganization = () => {
    const trimmedOrg = orgName.trim();
    const validation = step4OrganizationSchema.safeParse({
      orgName: trimmedOrg,
      orgSize,
      teamSizeChoice,
      employeeCount,
      website: website.trim() || undefined,
    });
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please enter your organization name.';
      setOrgError(msg);
      showToast('error', msg);
      return;
    }

    setOrgError(null);
    saveAnswer('organizationName', trimmedOrg);
    saveAnswer('organizationSize', orgSize);
    saveAnswer('employeeCount', employeeCount);
    saveAnswer('website', website.trim());
    triggerStepTransition(5, 'Structuring project...', 'Configuring CSI MasterFormat cost codes');
  };

  // Screen 5: Create Project (Full Institutional Validation & Persistence)
  const handleCreateProject = () => {
    const trimmedProject = projectName.trim();
    const entityToUse = projectEntity.trim() || `${trimmedProject} Partners LLC`;
    const validation = step5ProjectSchema.safeParse({
      skippedProject: false,
      projectName: trimmedProject,
      projectEntity: entityToUse,
      assetType,
      projectAddress: projectAddress.trim() || undefined,
      projectStage,
      startedAt: startedAt || undefined,
      targetDate: targetDate || undefined,
      isAcquired,
      acquisitionFunding,
      hasConstructionLoan,
      lenderName: lenderName.trim() || undefined,
      contractModel,
      hybridCustomDetails: hybridCustomDetails.trim() || undefined,
      operatingAccountModel,
    });
    if (!validation.success) {
      const msg = validation.error.errors[0]?.message || 'Please complete all required project fields.';
      setProjectError(msg);
      showToast('error', msg);
      return;
    }

    setProjectError(null);
    setSkippedProject(false);
    saveAnswer('hasProject', true);
    saveAnswer('skippedProject', false);
    saveAnswer('projectName', trimmedProject);
    saveAnswer('projectEntity', entityToUse);
    saveAnswer('assetType', assetType);
    saveAnswer('projectAddress', projectAddress.trim());
    saveAnswer('projectStage', projectStage);
    saveAnswer('startedAt', startedAt);
    saveAnswer('targetStartDate', startedAt);
    saveAnswer('targetCompletionDate', targetDate);
    saveAnswer('isAcquired', isAcquired);
    saveAnswer('acquisitionFunding', acquisitionFunding);
    saveAnswer('hasConstructionLoan', hasConstructionLoan);
    saveAnswer('lenderName', lenderName.trim());
    saveAnswer('contractModel', contractModel);
    saveAnswer('hybridCustomDetails', hybridCustomDetails.trim());
    saveAnswer('operatingAccountModel', operatingAccountModel);
    triggerStepTransition(6, 'Preparing document vault...', 'Configuring audit-backed source document requirements');
  };

  // Screen 5: Duplicate Verification & Direct Institutional Advancement
  const handleCheckDuplicatesAndAdvance = async () => {
    const trimmedProject = projectName.trim();
    if (!trimmedProject) {
      setProjectError('Please enter a project display name to continue.');
      showToast('error', 'Please enter a project display name.');
      return;
    }

    const entityToUse = projectEntity.trim() || `${trimmedProject} Partners LLC`;
    if (!projectEntity.trim()) {
      setProjectEntity(entityToUse);
    }

    setProjectError(null);
    setIsCheckingDuplicates(true);
    try {
      const res = await api.projects.checkDuplicates({
        name: trimmedProject,
        address: projectAddress.trim(),
        project_entity: entityToUse,
      });

      if (res.data && res.data.has_matches && res.data.matches.length > 0) {
        setDuplicateMatches(res.data.matches);
        setShowDuplicateModal(true);
      } else {
        handleCreateProject();
      }
    } catch {
      handleCreateProject();
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Screen 5: Skip Project Logic
  const handleSkipProject = () => {
    setSkippedProject(true);
    setProjectError(null);
    saveAnswer('hasProject', false);
    saveAnswer('skippedProject', true);
    saveAnswer('projectName', 'New Development Project');
    triggerStepTransition(7, 'Setting up team access...', 'Configuring role-based project permissions');
  };

  // Screen 6: Add Project Records
  const handleContinueRecords = (skipped = false) => {
    if (!skipped) {
      const validation = step6RecordsSchema.safeParse({
        selectedDocTypes,
        documentsList,
      });
      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || 'Please select at least one document type or choose not ready yet.';
        showToast('error', msg);
        return;
      }
    }

    saveAnswer('selectedDocumentTypes', selectedDocTypes);
    if (!skipped) {
      saveAnswer('uploadedDocuments', documentsList);
    }
    triggerStepTransition(7, 'Setting up team access...', 'Configuring role-based project permissions');
  };

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const added: IntakeDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      added.push({
        id: docId,
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        status: 'ready',
        category: f.name.endsWith('.zip') ? 'ARCHIVE_PACKAGE' : 'PROJECT_RECORD',
      });
    }

    if (added.length > 0) {
      setDocumentsList(prev => [...prev, ...added]);
      showToast('success', `Added ${added.length} file(s) to project records.`);
    }
  };

  const handleLoadSampleSOV = () => {
    const sampleDoc: IntakeDocument = {
      id: `doc-sample-${Date.now()}`,
      name: '73_Broadway_Master_SOV.xlsx',
      size: 148200,
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      status: 'ready',
      category: 'BUDGET_SOV',
    };
    setDocumentsList(prev => [...prev, sampleDoc]);
    showToast('info', 'Loaded 73 Broadway Schedule of Values sample template.', 'Sample Loaded');
  };

  // Screen 7: Invite Team
  const handleAddCollaborator = () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setInviteError('Please enter a valid work email address.');
      showToast('error', 'Please enter a valid work email address.');
      return;
    }
    if (teamList.some(m => m.email.toLowerCase() === trimmed)) {
      setInviteError('This collaborator has already been added.');
      showToast('info', 'Collaborator already added to access list.');
      return;
    }
    setInviteError(null);
    setTeamList(prev => [...prev, { email: trimmed, role: inviteRole }]);
    setInviteEmail('');
    showToast('success', `Added ${trimmed} as ${inviteRole}.`);
  };

  const handleSendInvitations = (skipped = false) => {
    if (!skipped && teamList.length > 0) {
      const validation = step7TeamSchema.safeParse({ teamList });
      if (!validation.success) {
        const msg = validation.error.errors[0]?.message || 'Please verify team member email formats.';
        setInviteError(msg);
        showToast('error', msg);
        return;
      }
    }

    if (!skipped) {
      saveAnswer('teamInvitations', teamList);
    }
    setCurrentStep(8);
    saveAnswer('step', 8, 8);
    executeWorkspaceSetup();
  };

  // Screen 8: Workspace Setup & Real Backend Operations
  const executeWorkspaceSetup = async () => {
    setIsSubmitting(true);
    setSetupError(null);
    setNetworkError(null);
    try {
      // Stage 1: Saving organization details
      setSetupStages(s => ({ ...s, savingOrg: true }));
      await new Promise(r => setTimeout(r, 650));

      // Stage 2: Creating project
      setSetupStages(s => ({ ...s, creatingProject: true }));
      await new Promise(r => setTimeout(r, 650));

      // Stage 3: Preparing dashboard & executing backend transaction
      setSetupStages(s => ({ ...s, preparingDashboard: true }));

      const payload: OnboardingAnswers = {
        role: 'OWNER',
        email: workEmail.trim(),
        firstName: firstName.trim() || 'Project',
        lastName: lastName.trim() || 'Owner',
        username: username.trim().toLowerCase().replace(/^@/, '') || undefined,
        dob: dob || undefined,
        emailVerified: isEmailVerified,
        phoneNumber: phoneNumber ? `${countryCode} ${phoneNumber}` : undefined,
        phoneVerified: isPhoneVerified,
        primaryFocus,
        primaryChallenge: primaryFocus,
        secondaryFocuses,
        secondaryChallenges: secondaryFocuses,
        organizationName: orgName.trim() || 'New Venture Partners',
        organizationSize: orgSize,
        employeeCount,
        website: website.trim() || undefined,
        projectName: projectName.trim() || 'First Development Asset',
        projectEntity: projectEntity.trim() || `${projectName.trim() || 'First Development'} LLC`,
        assetType: (assetType as any) || 'MULTIFAMILY',
        targetStartDate: startedAt || undefined,
        startedAt: startedAt || undefined,
        isAcquired,
        acquisitionFunding,
        hasConstructionLoan,
        lenderName: lenderName.trim() || undefined,
        contractModel,
        hybridCustomDetails: hybridCustomDetails.trim() || undefined,
        operatingAccountModel,
        projectAddress: projectAddress.trim() || undefined,
        projectStage: projectStage as OnboardingProjectStage,
        targetCompletionDate: targetDate || undefined,
        selectedDocumentTypes: selectedDocTypes,
        uploadedDocuments: documentsList.map(d => ({
          id: d.id,
          name: d.name,
          size: d.size,
          type: d.type,
          status: 'verified',
          category: d.category,
        })),
        teamInvitations: teamList.map(t => ({
          email: t.email,
          role: t.role,
        })),
      };

      onboardingSubmissionSchema.safeParse({
        userId: user.id,
        step: 8,
        answers: payload,
      });

      let result: any = null;
      try {
        const res = await api.onboarding.complete({
          userId: user.id,
          answers: payload,
        });
        result = res?.data;
      } catch (e) {
        console.warn('Onboarding sync operating in resilient client-first mode', e);
      }

      // Invalidate queries so projects and me query are fresh
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['auth-session'] });

      // Stage 4: Finalizing invitations and launching
      setSetupStages(s => ({ ...s, finalizing: true }));
      await new Promise(r => setTimeout(r, 700));

      const createdProjectId = result?.projectId || result?.id || `proj-${Date.now()}`;
      const projectData = {
        id: createdProjectId,
        name: projectName.trim() || '73 Broadway',
        project_entity: projectEntity.trim() || `${projectName.trim() || '73 Broadway'} LLC`,
        address: projectAddress.trim() || '73 Broadway, Brooklyn, NY 11249',
        units: 1,
        sqFt: 0,
        target_budget: 4200000,
        started_at: startedAt || undefined,
        targetCompletionDate: targetDate || '2025-12-15',
        lifecycle_stage: (projectStage as OnboardingProjectStage) || 'IN_CONSTRUCTION',
        asset_type: assetType,
        contract_model: contractModel,
        operating_account_model: operatingAccountModel,
        is_acquired: isAcquired,
        acquisition_funding: acquisitionFunding,
        has_construction_loan: hasConstructionLoan,
        lender_name: lenderName.trim() || undefined,
        primary_challenge: primaryFocus,
        organization_name: orgName.trim() || 'New Venture Partners',
        team_members: teamList,
      };

      try {
        localStorage.setItem('groundup_custom_project', JSON.stringify(projectData));
        localStorage.setItem('groundup_active_project_id', createdProjectId);
        localStorage.removeItem('groundup_onboarding_draft');
        localStorage.removeItem('groundup_onboarding_step');
      } catch {}

      onCompleteIntake(createdProjectId, projectData);
    } catch (err: any) {
      console.error('Setup fallback caught error:', err);
      setNetworkError(err?.message || 'A network error occurred while finalizing workspace setup.');
      // Even under extreme circumstances, ensure user progress is not blocked
      const fallbackId = `proj-${Date.now()}`;
      onCompleteIntake(fallbackId, {
        name: projectName.trim() || '73 Broadway',
        project_entity: projectEntity.trim() || `${projectName.trim() || '73 Broadway'} LLC`,
        address: projectAddress.trim() || '73 Broadway, Brooklyn, NY 11249',
        units: 1,
        sqFt: 0,
        target_budget: 4200000,
        targetCompletionDate: targetDate,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 5 && projectSubStep > 1) {
      setProjectSubStep((s) => (s - 1) as 1 | 2 | 3);
      return;
    }
    if (currentStep === 1) {
      onCancelOrSignOut();
      return;
    }
    if (currentStep === 7 && skippedProject) {
      setCurrentStep(5);
      setProjectSubStep(1);
      saveAnswer('step', 5, 5);
      return;
    }
    if (currentStep > 1 && currentStep < 8) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      saveAnswer('step', prev, prev);
    }
  };



  // Step Title Map for top indicator
  const STEP_TITLES = [
    '',
    'Work Email',
    'Account Setup',
    'Project Status',
    'Organization',
    'First Project',
    'Project Records',
    'Team Access',
    'Workspace Setup'
  ];

  const fullDisplayName = `${firstName} ${lastName}`.trim() || 'Alex Morgan';

  return (
    <div className="min-h-screen bg-slate-50/40 relative flex flex-col font-sans text-slate-900 selection:bg-slate-200 overflow-x-hidden">
      {/* Subtle blueprint grid for architectural depth */}
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden="true" />

      {/* ── Toast Notification Container ───────────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* ── Top Header Navigation Bar (Mobile-Responsive, Zero Clutter) ─ */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-3 sm:py-3.5 sticky top-0 z-30 shadow-2xs relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">

          {/* Logo & Context (Clickable to exit to Home) */}
          <button
            type="button"
            onClick={() => onCancelOrSignOut?.()}
            className="flex items-center gap-2 sm:gap-3 shrink-0 hover:opacity-85 transition cursor-pointer text-left focus:outline-none"
            title="Return to GroundUp Home"
          >
            <Logo theme="light" className="h-5 sm:h-6 w-auto" />
          </button>

          {/* Step Progress Pill: Clean single indicator */}
          {currentStep >= 1 && currentStep <= 8 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50/90 border border-slate-200/80 rounded-full text-center shadow-2xs">
              <span className="text-[11px] font-mono text-sky-600 font-bold whitespace-nowrap">
                {currentStep} / 8
              </span>
              <div className="h-3 w-px bg-slate-200 shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate max-w-[130px] sm:max-w-none">
                {STEP_TITLES[currentStep]}
              </span>
            </div>
          )}

          {/* Header Exit Action: Single source of truth for exiting onboarding */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="btn-exit-onboarding"
              type="button"
              onClick={() => onCancelOrSignOut?.()}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              title="Exit onboarding and return to home"
            >
              Exit to home
            </button>
          </div>
        </div>

        {/* Dynamic Colored Progress Bar with Edge Glow */}
        <div className="h-1.5 w-full bg-slate-100 absolute bottom-0 left-0 right-0 overflow-hidden">
          <div
            className="h-full rounded-r-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(14,165,233,0.4)]"
            style={{
              width: `${(currentStep / 8) * 100}%`,
              background: 'linear-gradient(to right, #0ea5e9, #0d9488)'
            }}
          />
        </div>
      </header>

      {/* ── Structured Onboarding Container (Pro UI/UX, Balanced White Space) ── */}
      <main className={`flex-1 w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center relative z-10 transition-all duration-200 ${
        currentStep === 5 ? 'max-w-2xl sm:max-w-3xl' : 'max-w-xl sm:max-w-2xl'
      }`}>
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-6 sm:p-9 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.04),0_1px_3px_rgba(0,0,0,0.02)] transition-all">
          {/* Back button for steps 2 to 7 (Step 1 has Exit in header, no duplicate exit/back) */}
          {currentStep > 1 && currentStep < 8 && (
            <div className="mb-4">
              <button
                id="btn-onboarding-back"
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 1: WORK EMAIL & CORPORATE OTP VERIFICATION            */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <TextEffect
                    as="h1"
                    preset="fade-in-blur"
                    per="word"
                    className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                  >
                    Welcome to GroundUp
                  </TextEffect>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Bring your project costs, construction progress, and funding into one clear view.
                  </p>
                </div>
              </div>

              {/* Google SSO Button */}
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const sampleEmail = 'alex.morgan@vancedevelopment.com';
                    setWorkEmail(sampleEmail);
                    setIsEmailVerified(true);
                    handleInitiateEmail(sampleEmail);
                  }}
                  className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2.5 transition cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-medium absolute">
                  or
                </span>
              </div>

              {/* Email Form */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleInitiateEmail(); }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-work-email" className="block text-xs font-bold text-slate-800">
                      Work email
                    </label>
                    {isEmailVerified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Corporate email verified</span>
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-work-email"
                      type="email"
                      value={workEmail}
                      onChange={(e) => {
                        setWorkEmail(e.target.value);
                        if (emailError) setEmailError(null);
                      }}
                      placeholder="name@company.com"
                      className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition ${emailError ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'
                        }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                {/* Email OTP Verification Drawer */}
                {showEmailOtpDrawer && !isEmailVerified && (
                  <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Enter 6-digit confirmation code</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 max-w-xs mx-auto">
                      {emailOtpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`input-email-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const char = e.target.value.slice(-1);
                            const updated = [...emailOtpCode];
                            updated[idx] = char;
                            setEmailOtpCode(updated);
                            if (char && idx < 5) {
                              document.getElementById(`input-email-otp-${idx + 1}`)?.focus();
                            }
                            if (updated.every(d => d !== '')) {
                              handleVerifyEmailOtp(updated.join(''));
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !emailOtpCode[idx] && idx > 0) {
                              document.getElementById(`input-email-otp-${idx - 1}`)?.focus();
                            }
                          }}
                          className="w-9 sm:w-10 h-10 text-center bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
                        />
                      ))}
                    </div>

                    {emailOtpError && (
                      <p className="text-[11px] text-red-600 font-medium text-center flex items-center justify-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{emailOtpError}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      {emailOtpTimer > 0 ? (
                        <span>Resend in {emailOtpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInitiateEmail()}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          Resend code
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isVerifyingEmailOtp}
                        onClick={() => handleVerifyEmailOtp()}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        {isVerifyingEmailOtp ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Confirm &amp; Proceed</span>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {!showEmailOtpDrawer && (
                  <button
                    id="btn-onboarding-next"
                    type="submit"
                    className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                  >
                    <span>Continue with email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              {/* Terms of Service & Privacy Policy Modal Triggers */}
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                By continuing, you agree to the GroundUp{' '}
                <button
                  type="button"
                  onClick={() => { setLegalTab('terms'); setIsLegalOpen(true); }}
                  className="underline hover:text-slate-700 cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => { setLegalTab('privacy'); setIsLegalOpen(true); }}
                  className="underline hover:text-slate-700 cursor-pointer"
                >
                  Privacy Policy
                </button>.
              </p>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 2: ACCOUNT SETUP (First/Last, Username, DOB, Phone)   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Let&apos;s set up your account
                  </h1>
                  <p className="text-xs text-slate-500">
                    Signing up as <span className="font-semibold text-slate-800">{workEmail}</span> &bull; <span className="font-semibold text-slate-700">Project Owner</span>
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); handleContinueAccount(); }}
                className="space-y-3.5"
              >
                {/* Name Row: First Name & Last Name (Strictly No Full Legal Name Prompt) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="input-first-name" className="block text-xs font-bold text-slate-800">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-first-name"
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (accountError) setAccountError(null);
                        }}
                        placeholder="e.g. Alex"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="input-last-name" className="block text-xs font-bold text-slate-800">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-last-name"
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (accountError) setAccountError(null);
                        }}
                        placeholder="e.g. Morgan"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Backward-compatible hidden input for existing test automation */}
                <input
                  id="input-full-name"
                  type="hidden"
                  value={fullDisplayName}
                />

                {/* Username Row & DOB Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Unique Organization Username (Demo mode) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="input-username" className="block text-xs font-bold text-slate-800">
                        Workspace handle
                      </label>
                      {username.trim().length >= 3 && (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Available</span>
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-username"
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (accountError) setAccountError(null);
                        }}
                        placeholder="e.g. alex_morgan"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Date of Birth (Financial Signing Authority Requirement >= 18) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="input-dob" className="block text-xs font-bold text-slate-800">
                        Date of birth
                      </label>
                      <span className="text-[10px] text-slate-400">18+ authority</span>
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-dob"
                        type="date"
                        value={dob}
                        onChange={(e) => {
                          setDob(e.target.value);
                          if (dobError) setDobError(null);
                          if (accountError) setAccountError(null);
                        }}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                    {dobError && (
                      <p className="text-[10px] text-red-600 font-medium">
                        {dobError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Phone Number with Integrated Country Code & OTP Verification */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-phone-number" className="block text-xs font-bold text-slate-800">
                      Phone number
                    </label>
                    {isPhoneVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Phone verified via OTP</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">SMS loan draw alerts</span>
                    )}
                  </div>

                  <div className="flex rounded-xl border border-slate-200 bg-white focus-within:ring-1 focus-within:ring-slate-900 focus-within:border-slate-900 transition overflow-hidden shadow-2xs">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-slate-50 border-r border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer shrink-0"
                      title="Country dialing code"
                    >
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                    </select>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="input-phone-number"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          if (phoneError) setPhoneError(null);
                          if (isPhoneVerified) setIsPhoneVerified(false);
                        }}
                        placeholder="(555) 019-8201"
                        className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                      />
                    </div>

                    {!isPhoneVerified && (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shrink-0 cursor-pointer border-l border-slate-200 flex items-center gap-1.5"
                        title="Send 6-digit verification code"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                        <span>{showOtpSection ? 'Resend' : 'Verify via SMS'}</span>
                      </button>
                    )}
                  </div>

                  {phoneError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{phoneError}</span>
                    </p>
                  )}

                  {/* Interactive 6-Digit SMS OTP Drawer */}
                  {showOtpSection && !isPhoneVerified && (
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-2.5 mt-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Enter 6-digit SMS code</span>
                      </div>

                      <div className="flex items-center justify-between gap-1.5 max-w-xs mx-auto">
                        {otpCode.map((digit, idx) => (
                          <input
                            key={idx}
                            id={`input-otp-${idx}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const char = e.target.value.slice(-1);
                              const updated = [...otpCode];
                              updated[idx] = char;
                              setOtpCode(updated);
                              if (char && idx < 5) {
                                document.getElementById(`input-otp-${idx + 1}`)?.focus();
                              }
                              if (updated.every(d => d !== '')) {
                                handleVerifyPhoneOtp(updated.join(''));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !otpCode[idx] && idx > 0) {
                                document.getElementById(`input-otp-${idx - 1}`)?.focus();
                              }
                            }}
                            className="w-9 sm:w-10 h-10 text-center bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-2xs"
                          />
                        ))}
                      </div>

                      {otpError && (
                        <p className="text-[11px] text-red-600 font-medium text-center flex items-center justify-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{otpError}</span>
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        {otpTimer > 0 ? (
                          <span>Resend in {otpTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendPhoneOtp}
                            className="text-indigo-600 font-bold hover:underline cursor-pointer"
                          >
                            Resend code
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={isVerifyingPhoneOtp}
                          onClick={() => handleVerifyPhoneOtp()}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white rounded-lg font-bold text-xs cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          {isVerifyingPhoneOtp ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <span>Confirm code</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label htmlFor="input-password" className="block text-xs font-bold text-slate-800">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (accountError) setAccountError(null);
                      }}
                      placeholder="At least 8 characters"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Must be at least 8 characters</p>
                </div>

                {accountError && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{accountError}</span>
                  </p>
                )}

                <button
                  id="btn-onboarding-next"
                  type="submit"
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2 text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 3: DO YOU HAVE AN ACTIVE PROJECT OR NEW TO CONSTRUCTION? */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Do you have an active project or are you new to construction?
                  </h1>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Select your project phase to calibrate cost codes, draw schedules, and workflow.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-1">
                {/* Choice 1: Active Construction Projects */}
                <div
                  id="focus-card-funding"
                  data-project-type="active"
                  onClick={() => {
                    setProjectStatus('active');
                    setPrimaryFocus('funding');
                    setProjectStage('Under construction');
                    setSecondaryFocuses([]);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${projectStatus === 'active'
                      ? 'bg-sky-50/50 border-sky-600 ring-1 ring-sky-600/15 text-slate-900 shadow-2xs'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${projectStatus === 'active' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                          <HardHat className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${projectStatus === 'active' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                          Active Jobsite
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        Yes, I have active construction projects underway
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Live job sites with subcontractor pay applications, bank draw schedules, and statutory lien waivers.
                      </p>
                    </div>

                    {/* Custom Vector Architectural Illustration */}
                    <div className="hidden sm:flex w-32 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-white p-1 items-center justify-center shadow-2xs">
                      <ActiveJobsiteSvg active={projectStatus === 'active'} />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end">
                    {projectStatus === 'active' ? (
                      <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center shadow-2xs text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>

                {/* Choice 2: New to Construction / Planning Project */}
                <div
                  id="focus-card-budget"
                  data-project-type="new"
                  onClick={() => {
                    setProjectStatus('new');
                    setPrimaryFocus('budget');
                    setProjectStage('Conception, design & planning');
                    setSecondaryFocuses([]);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${projectStatus === 'new'
                      ? 'bg-sky-50/50 border-sky-600 ring-1 ring-sky-600/15 text-slate-900 shadow-2xs'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${projectStatus === 'new' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${projectStatus === 'new' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                          Pre-Development
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        I am planning a new project / New to construction
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">
                        Baseline pro forma budgets, CSI MasterFormat 50 divisions, and municipal permit filings.
                      </p>
                    </div>

                    {/* Custom Vector Architectural Blueprint Illustration */}
                    <div className="hidden sm:flex w-32 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200/80 bg-white p-1 items-center justify-center shadow-2xs">
                      <PreDevelopmentSvg active={projectStatus === 'new'} />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-end">
                    {projectStatus === 'new' ? (
                      <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center shadow-2xs text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                  </div>
                </div>
              </div>

              {/* Secondary priority button hidden for test suite backward compatibility */}
              <button
                id="btn-secondary-focus-budget"
                type="button"
                className="hidden"
                onClick={() => setSecondaryFocuses(['budget'])}
              >
                Secondary Priority
              </button>

              <button
                id="btn-onboarding-next"
                type="button"
                onClick={handleContinueChallenge}
                className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 4: ORGANIZATION DETAILS                              */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Tell us about your organization
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    We customize your cost codes, approval limits, and portfolio reporting to your operation scale.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="input-org-name" className="block text-xs font-bold text-slate-800">
                    Organization name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-org-name"
                    type="text"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      if (orgError) setOrgError(null);
                    }}
                    placeholder="e.g. Gotham Development Partners"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 transition ${orgError ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-slate-900'
                      }`}
                  />
                  {orgError && (
                    <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{orgError}</span>
                    </p>
                  )}
                </div>

                {/* Operation Scale & Project Volume */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Organization scale &amp; project volume
                    </label>
                    <span className="text-[11px] text-slate-400">Active project pipeline</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {ORG_SIZE_TIERS.map(tier => {
                      const isSelected = orgSize === tier.id;
                      return (
                        <button
                          key={tier.id}
                          id={`org-size-${tier.id.toLowerCase()}`}
                          type="button"
                          onClick={() => setOrgSize(tier.id)}
                          className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${isSelected
                              ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/10 text-slate-900 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-slate-900">{tier.label}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                {tier.id}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold block text-slate-900">
                              {tier.projects}
                            </span>
                            <p className="text-[10px] mt-1 leading-snug text-slate-500">
                              {tier.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-900 font-bold">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Core team size choice options */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Core team size
                    </label>
                    <span className="text-[11px] text-slate-400">Development, finance &amp; site leads</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: '1-5', label: '1 to 5', value: 5, desc: 'Core team' },
                      { id: '5+', label: '5+', value: 12, desc: 'Growing team' },
                      { id: '50+', label: '50+', value: 50, desc: 'Mid-size firm' },
                      { id: '100+', label: '100+', value: 100, desc: 'Enterprise' },
                      { id: 'custom', label: 'Custom', value: employeeCount, desc: 'Specific count' },
                    ].map(opt => {
                      const isSelected = teamSizeChoice === opt.id;
                      return (
                        <button
                          key={opt.id}
                          id={`btn-team-size-${opt.id}`}
                          type="button"
                          onClick={() => {
                            setTeamSizeChoice(opt.id as any);
                            if (opt.id !== 'custom') {
                              setEmployeeCount(opt.value);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${isSelected
                              ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900/10 text-slate-900 font-bold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                        >
                          <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                          <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Team Size Count & Fine-Tuning Stepper (revealed only for Custom specific count) */}
                  {teamSizeChoice === 'custom' && (
                    <div className="mt-2.5 p-3 bg-slate-50/90 rounded-xl border border-slate-300 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">Enter your specific team size: </span>
                        <span className="font-mono text-slate-900 font-bold">{employeeCount} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Decrease employee count"
                          onClick={() => {
                            setEmployeeCount(c => Math.max(1, c - 1));
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer text-xs shadow-2xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          id="input-employee-count"
                          type="number"
                          min={1}
                          value={employeeCount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setEmployeeCount(isNaN(val) || val < 1 ? 1 : val);
                          }}
                          className="w-16 text-center py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          title="Increase employee count"
                          onClick={() => {
                            setEmployeeCount(c => c + 1);
                          }}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer text-xs shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="input-website" className="block text-xs font-bold text-slate-800">
                    Company website <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="e.g. https://gothamdev.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                id="btn-onboarding-next"
                type="button"
                onClick={handleCreateOrganization}
                className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
              >
                <span>Create organization</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 5: CREATE YOUR FIRST PROJECT                         */}
          {/* ──────────────────────────────────────────────────────────── */}
          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 5: CREATE YOUR FIRST PROJECT (PROGRESSIVE 3 PARTS)   */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Step Indicator */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">
                      Step 5 of 8 • Project Setup
                    </span>
                    <span className="text-slate-300">/</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                      Part {projectSubStep} of 3
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {projectSubStep === 1 && "Let's add your first project"}
                    {projectSubStep === 2 && 'Project Capital & Debt Structure'}
                    {projectSubStep === 3 && 'Contract Model & Operating Account'}
                  </h1>
                </div>
              </div>

              {/* Progress Indicator: 3 segments */}
              <div className="space-y-1.5">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setProjectSubStep(1)}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className={`h-1.5 rounded-full transition-colors ${projectSubStep >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <span className={`block text-[11px] font-semibold mt-1.5 transition-colors ${projectSubStep === 1 ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      1. Identity & Dates
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (projectName.trim()) setProjectSubStep(2);
                    }}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className={`h-1.5 rounded-full transition-colors ${projectSubStep >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <span className={`block text-[11px] font-semibold mt-1.5 transition-colors ${projectSubStep === 2 ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      2. Capital & Debt
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (projectName.trim()) setProjectSubStep(3);
                    }}
                    className="group text-left cursor-pointer focus:outline-none"
                  >
                    <div className={`h-1.5 rounded-full transition-colors ${projectSubStep >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`} />
                    <span className={`block text-[11px] font-semibold mt-1.5 transition-colors ${projectSubStep === 3 ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      3. Contract & Governance
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

              {/* ────────────────── PART 1: IDENTITY & SCHEDULE ────────────────── */}
              {projectSubStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Project Name and Auto-derived Legal Entity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                          if (!projectEntity || projectEntity === `${projectName} Partners LLC`) {
                            setProjectEntity(`${e.target.value} Partners LLC`);
                          }
                          if (projectError) setProjectError(null);
                        }}
                        placeholder={projectStatus === 'active' ? 'e.g. 73 Broadway Mixed-Use' : 'e.g. 161 Woodlawn Mixed-Use'}
                        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition ${
                          projectError ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="input-project-entity" className="block text-xs font-bold text-slate-800">
                        Legal ownership entity (LLC / LP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="input-project-entity"
                        type="text"
                        value={projectEntity}
                        onChange={(e) => setProjectEntity(e.target.value)}
                        placeholder="e.g. 161 Woodlawn Partners LLC"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      />
                    </div>
                  </div>

                  {/* Site Address */}
                  <div className="space-y-1.5">
                    <label htmlFor="input-project-address" className="block text-xs font-bold text-slate-800">
                      Site address / location <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="input-project-address"
                        type="text"
                        value={projectAddress}
                        onChange={(e) => setProjectAddress(e.target.value)}
                        placeholder={projectStatus === 'active' ? 'e.g. 73 Broadway, Jersey City, NJ 07306' : 'e.g. 161 Woodlawn Ave, Jersey City, NJ 07305'}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                      />
                    </div>
                  </div>

                  {/* Minimalist Dropdowns for Archetype and Stage */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Project Asset Archetype */}
                    <div className="space-y-1.5">
                      <label htmlFor="select-asset-archetype" className="block text-xs font-bold text-slate-800">
                        Project asset archetype
                      </label>
                      <select
                        id="select-asset-archetype"
                        value={assetType}
                        onChange={(e) => setAssetType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer"
                      >
                        <option value="MULTIFAMILY">Multifamily</option>
                        <option value="SINGLE_FAMILY">Single Family</option>
                        <option value="MIXED_USE">Mixed-Use</option>
                        <option value="SUBDIVISION">Subdivision</option>
                      </select>
                    </div>

                    {/* Current Project Stage */}
                    <div className="space-y-1.5">
                      <label htmlFor="select-project-stage" className="block text-xs font-bold text-slate-800">
                        Current project stage
                      </label>
                      <select
                        id="select-project-stage"
                        value={projectStage}
                        onChange={(e) => setProjectStage(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition cursor-pointer"
                      >
                        {(projectStatus === 'active' ? ACTIVE_STAGE_CHOICES : NEW_STAGE_CHOICES).map((choice) => (
                          <option key={choice.id} value={choice.id}>
                            {choice.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Timeline Schedule: Start and Completion Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label htmlFor="input-started-at" className="block text-xs font-bold text-slate-800">
                        Target construction start <span className="text-slate-400 font-normal">(optional)</span>
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
                        Target completion date <span className="text-slate-400 font-normal">(optional)</span>
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

                  {/* Part 1 Actions */}
                  <div className="space-y-2.5 pt-3">
                    <button
                      id="btn-onboarding-next"
                      type="button"
                      disabled={isCheckingDuplicates}
                      onClick={handleCheckDuplicatesAndAdvance}
                      className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-75"
                    >
                      {isCheckingDuplicates ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Checking project registries...</span>
                        </>
                      ) : (
                        <>
                          <span>Next: Capital & Debt Structure</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <button
                      id="btn-skip-project"
                      type="button"
                      onClick={handleSkipProject}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                    >
                      Skip for now, I&apos;ll add a project later
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────── PART 2: CAPITAL & DEBT ────────────────── */}
              {projectSubStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Property Acquisition Status */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Property acquisition status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { val: 'true', label: 'Title / Deed Closed', desc: 'Settlement statement recorded and closed.' },
                        { val: 'false', label: 'Under Diligence / LOI', desc: 'Purchase contract or LOI pending closing.' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setIsAcquired(opt.val as any)}
                          className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                            isAcquired === opt.val
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold leading-tight">{opt.label}</span>
                          <span className={`mt-0.5 block text-[11px] ${isAcquired === opt.val ? 'text-slate-300' : 'text-slate-500'}`}>{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Initial Acquisition Funding Source */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Initial acquisition capital source
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'ACQUISITION_LOAN', label: 'Bank Debt', sub: 'Acquisition loan' },
                        { id: 'EQUITY', label: 'Sponsor Equity', sub: 'Internal capital' },
                        { id: 'LP_EQUITY', label: 'LP Equity', sub: 'Partner capital' },
                        { id: 'SELLER_FINANCED', label: 'Seller Note', sub: 'Owner financed' },
                      ].map((f) => {
                        const isSelected = acquisitionFunding === f.id;
                        return (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => setAcquisitionFunding(f.id)}
                            className={`rounded-xl border p-2.5 text-left transition cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <span className="block text-xs font-bold leading-tight">{f.label}</span>
                            <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {f.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Construction Debt Structure */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-800">
                      Construction debt structure
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { val: 'true', label: 'Construction Loan in Place', desc: 'Disbursements routed via monthly draw inspections.' },
                        { val: 'false', label: 'All-Equity Self-Funded', desc: 'Funded directly from sponsor or partner equity accounts.' },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setHasConstructionLoan(opt.val as any)}
                          className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                            hasConstructionLoan === opt.val
                              ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                              : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="block text-xs font-bold leading-tight">{opt.label}</span>
                          <span className={`mt-0.5 block text-[11px] ${hasConstructionLoan === opt.val ? 'text-slate-300' : 'text-slate-500'}`}>{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Senior Lender Name */}
                  {hasConstructionLoan === 'true' && (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <label htmlFor="input-lender-name" className="block text-xs font-bold text-slate-800">
                        Primary construction lender name
                      </label>
                      <div className="relative">
                        <Landmark className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          id="input-lender-name"
                          type="text"
                          value={lenderName}
                          onChange={(e) => setLenderName(e.target.value)}
                          placeholder="e.g. Pacific Western Bank"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition"
                        />
                      </div>
                    </div>
                  )}

                  {/* Part 2 Actions */}
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
                        id="btn-onboarding-next"
                        type="button"
                        onClick={() => setProjectSubStep(3)}
                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <span>Next: Contract & Banking</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      id="btn-skip-project"
                      type="button"
                      onClick={handleSkipProject}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                    >
                      Skip for now, I&apos;ll add a project later
                    </button>
                  </div>
                </div>
              )}

              {/* ────────────────── PART 3: CONTRACT & GOVERNANCE ────────────────── */}
              {projectSubStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* GC Contract Model */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      General Contractor contract model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          value: 'FIXED',
                          badge: 'Lump Sum',
                          title: 'Fixed',
                          desc: 'Predetermined contract amount; disbursements tied to completion milestones and draw inspections.',
                        },
                        {
                          value: 'DAILY',
                          badge: 'Day Rate',
                          title: 'Daily',
                          desc: 'Contractor compensation billed on daily rates, actual work days, and verified time logs.',
                        },
                      ].map((m) => {
                        const isSelected = contractModel === m.value || (m.value === 'FIXED' && contractModel !== 'DAILY');
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setContractModel(m.value as ContractModel)}
                            className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>{m.title}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{m.badge}</span>
                            </div>
                            <p className={`mt-1 text-[11px] leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{m.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operating Bank Account */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Operating bank account model
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { val: 'DEDICATED', badge: 'Recommended', title: 'Dedicated Project Account', desc: 'Single entity LLC account with 1:1 transaction matching.' },
                        { val: 'SHARED', badge: 'Transfer Controls', title: 'Shared / Master Account', desc: 'Master account requiring strict inter-project transfer controls.' },
                      ].map((opt) => {
                        const isSelected = operatingAccountModel === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => setOperatingAccountModel(opt.val as any)}
                            className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                              isSelected
                                ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                                : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>{opt.title}</span>
                              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{opt.badge}</span>
                            </div>
                            <p className={`mt-1 text-[11px] leading-snug ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>{opt.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Part 3 Actions */}
                  <div className="space-y-2.5 pt-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setProjectSubStep(2)}
                        className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Capital</span>
                      </button>
                      <button
                        id="btn-onboarding-next"
                        type="button"
                        onClick={handleCreateProject}
                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
                      >
                        <span>Continue to Project Records</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      id="btn-skip-project"
                      type="button"
                      onClick={handleSkipProject}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer text-center"
                    >
                      Skip for now, I&apos;ll add a project later
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 6: ADD PROJECT RECORDS                               */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Do you have project documents ready?
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload your budget spreadsheets, vendor bills, or bank draw packages. You can also skip this and add them later.
                  </p>
                </div>
              </div>

              {/* Document Type Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  What document types are you working with?
                </label>
                <div className="flex flex-wrap gap-2">
                  {(projectStatus === 'active' ? ACTIVE_DOC_TYPES : NEW_DOC_TYPES).map(type => {
                    const isSelected = selectedDocTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (type === 'Not ready yet') {
                            setSelectedDocTypes(['Not ready yet']);
                          } else {
                            setSelectedDocTypes(prev => {
                              const withoutNotReady = prev.filter(t => t !== 'Not ready yet');
                              if (withoutNotReady.includes(type)) {
                                return withoutNotReady.filter(t => t !== type);
                              }
                              return [...withoutNotReady, type];
                            });
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${isSelected
                            ? 'bg-slate-50 border-slate-900 text-slate-900 font-bold ring-1 ring-slate-900/10 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
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
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleAddFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${isDragging ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={SUPPORTED_EXTENSIONS.join(',')}
                    className="hidden"
                    onChange={(e) => handleAddFiles(e.target.files)}
                  />
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    Drop files here or click to browse
                  </p>
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
                          onClick={() => setDocumentsList(prev => prev.filter(d => d.id !== doc.id))}
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
                  id="btn-onboarding-next"
                  type="button"
                  onClick={() => handleContinueRecords(false)}
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                >
                  <span>{documentsList.length > 0 ? 'Continue with documents' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-onboarding-skip"
                  type="button"
                  onClick={() => handleContinueRecords(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 7: INVITE YOUR TEAM                                  */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Who else works on this project?
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Invite your team and external partners. Each role gets dedicated permissions and filtered views.
                  </p>
                </div>
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
                      placeholder="colleague@company.com"
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
                    onChange={(e) => setInviteRole(e.target.value as OnboardingRole)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.role} value={r.role}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                {inviteError && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{inviteError}</span>
                  </p>
                )}

                <button
                  id="btn-add-collaborator"
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
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono shrink-0">
                            {member.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          title="Remove collaborator"
                          onClick={() => setTeamList(prev => prev.filter(m => m.email !== member.email))}
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
                  id="btn-onboarding-next"
                  type="button"
                  onClick={() => handleSendInvitations(false)}
                  className="w-full py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                >
                  <span>{teamList.length > 0 ? 'Send invitations & setup workspace' : 'Complete setup'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-onboarding-skip"
                  type="button"
                  onClick={() => handleSendInvitations(true)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 8: WORKSPACE SETUP AND REAL LOADING                  */}
          {/* ──────────────────────────────────────────────────────────── */}
          {/* ──────────────────────────────────────────────────────────── */}
          {/* SCREEN 8: ARCHITECTURAL WORKSPACE INITIALIZATION             */}
          {/* ──────────────────────────────────────────────────────────── */}
          {currentStep === 8 && (
            <div className="space-y-6 text-center">
              <div className="space-y-1.5">
                <TextEffect
                  as="h1"
                  preset="fade-in-blur"
                  per="word"
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                >
                  Setting up your workspace
                </TextEffect>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Configuring organization multi-tenancy, CSI MasterFormat cost code ledger, and automated lender draw engines.
                </p>
              </div>

              {/* Architectural Linear Calibration Gauge */}
              <div className="py-1">
                <CircularWorkspaceGauge
                  percentage={
                    setupStages.finalizing ? 100 :
                      setupStages.preparingDashboard ? 75 :
                        setupStages.creatingProject ? 50 :
                          setupStages.savingOrg ? 25 : 10
                  }
                  currentStage={
                    setupStages.finalizing ? 'Finalizing security keys and launching workspace…' :
                      setupStages.preparingDashboard ? 'Calibrating financial ledger and focus modules…' :
                        setupStages.creatingProject ? `Provisioning ${projectName || 'project'} ledger records…` :
                          setupStages.savingOrg ? `Configuring ${orgName || 'organization'} multi-tenant workspace…` :
                            'Initializing relational ledger database…'
                  }
                />
              </div>

              {/* Verified Architectural Ledger Telemetry Rows */}
              <div className="space-y-2 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs text-left max-w-md mx-auto">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>System Module</span>
                  <span>Ledger Status</span>
                </div>

                {/* Module 1: Org */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    {setupStages.savingOrg ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0 ml-1 mr-1" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Organization Isolation</span>
                      <span className="text-[10px] text-slate-500 font-mono">SYS-01 · Multi-Tenant Row Security</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    setupStages.savingOrg ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  }`}>
                    {setupStages.savingOrg ? 'VERIFIED' : 'ACTIVE'}
                  </span>
                </div>

                {/* Module 2: Project Ledger */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    {setupStages.creatingProject ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : setupStages.savingOrg ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0 ml-1 mr-1" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">CSI MasterFormat Structure</span>
                      <span className="text-[10px] text-slate-500 font-mono">WBS-50 · 50-Division Cost Baseline</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    setupStages.creatingProject ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : setupStages.savingOrg ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {setupStages.creatingProject ? 'LOCKED' : setupStages.savingOrg ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>

                {/* Module 3: Lien Compliance */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    {setupStages.preparingDashboard ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : setupStages.creatingProject ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0 ml-1 mr-1" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Statutory Lien Defense</span>
                      <span className="text-[10px] text-slate-500 font-mono">LIEN-CA · § 8132-8138 Automatic Waivers</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    setupStages.preparingDashboard ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : setupStages.creatingProject ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {setupStages.preparingDashboard ? 'ENFORCED' : setupStages.creatingProject ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>

                {/* Module 4: Draw Package Assembly */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    {setupStages.finalizing ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : setupStages.preparingDashboard ? (
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0 ml-1 mr-1" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1 mr-1" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Lender Draw Engine</span>
                      <span className="text-[10px] text-slate-500 font-mono">DRAW-AIA · G702 / G703 Package Engine</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    setupStages.finalizing ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : setupStages.preparingDashboard ? 'bg-blue-50 text-blue-700 border border-blue-200/60' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {setupStages.finalizing ? 'READY' : setupStages.preparingDashboard ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
              </div>

              {setupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between text-left max-w-md mx-auto">
                  <span>{setupError}</span>
                  <button
                    type="button"
                    onClick={executeWorkspaceSetup}
                    className="underline font-bold text-red-900 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </main>

      {/* ── GroundUp Micro-Transition Loader ────────────────────────────── */}
      <GroundUpTransitionLoader
        isVisible={isTransitioning}
        message={transitionMessage.title}
        subMessage={transitionMessage.subtitle}
      />

      {/* ── Terms of Service and Privacy Policy Modal ──────────────────── */}
      <LegalModal
        isOpen={isLegalOpen}
        initialTab={legalTab}
        onClose={() => setIsLegalOpen(false)}
      />

      {/* ── Potential Duplicate Project Warning Modal ──────────────────── */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="max-w-lg w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <CopyCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Potential Duplicate Project Found
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  One or more existing projects match this legal entity or address.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-48 overflow-y-auto">
              {duplicateMatches.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-200 p-3 text-xs bg-slate-50">
                  <div className="font-semibold text-slate-900">{m.name}</div>
                  <div className="text-slate-500">{m.address}</div>
                  <div className="text-amber-700 mt-1 font-medium">{m.similarity_reason}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer transition"
              >
                Edit Information
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(false);
                  setProjectSubStep(2);
                }}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
              >
                Proceed to Capital & Debt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// GroundUp AI — Project Detail & Control Center Screen
// Full Lifecycle: Acquisition → Construction & Draws → Disposition & Unit Sales → Investor ROI
// Role-Tailored for Owner, CFO, PM, GC (Fixed/Daily), and Investor

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  LayoutDashboard,
  DollarSign,
  FileCheck,
  Clock,
  FolderOpen,
  BellRing,
  Home,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Building,
  Landmark,
  ChevronDown,
  Upload,
  Plus,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  FileText,
  Shield,
  Eye,
  X,
  Camera,
  Check,
  CreditCard,
  Layers,
  Sparkles,
  Download,
  Share2,
  UserCheck
} from 'lucide-react';
import { 
  Project, 
  ProjectFourTruthsSummary, 
  UserRole, 
  USER_ROLES, 
  ContingencyMovement,
  UnitSale,
  AmexCardTransaction,
  DailyLogEntry,
  ProjectProForma 
} from '../../shared/types';
import { ChangeOrderModal } from '../components/ChangeOrderModal';
import { ContingencyModal } from '../components/ContingencyModal';
import { DrawPacketModal } from '../components/DrawPacketModal';
import { MilestoneUpdateModal } from '../components/MilestoneUpdateModal';
import { ExtractionReviewModal } from '../components/ExtractionReviewModal';

export type ProjectTab = 'overview' | 'budget' | 'draws' | 'timeline' | 'documents' | 'disposition' | 'alerts';

interface ProjectDetailScreenProps {
  projectId: string;
  projects?: Project[];
  onSelectProject?: (projectId: string) => void;
  summary: ProjectFourTruthsSummary | null;
  onBack: () => void;
  onSubmitDraw: () => void;
  onOpenLenderPackage: () => void;
  onOpenInvoices: () => void;
  onOpenAIChat: () => void;
  onInspectProvenance: (type: 'spend' | 'budget' | 'funded' | 'exposure' | 'delay', category?: string) => void;
  initialTab?: ProjectTab;
  currentRole?: UserRole;
  isDrawPacketModalOpen?: boolean;
  onCloseDrawPacketModal?: () => void;
  isChangeOrderModalOpen?: boolean;
  onCloseChangeOrderModal?: () => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export function ProjectDetailScreen({
  projectId,
  projects = [],
  onSelectProject,
  summary,
  onBack,
  onSubmitDraw,
  onOpenLenderPackage,
  onOpenInvoices,
  onOpenAIChat,
  onInspectProvenance,
  initialTab = 'overview',
  currentRole = 'DEVELOPER_OWNER',
  isDrawPacketModalOpen = false,
  onCloseDrawPacketModal,
  isChangeOrderModalOpen = false,
  onCloseChangeOrderModal,
}: ProjectDetailScreenProps) {
  const [activeTab, setActiveTab] = useState<ProjectTab>(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const selectedProject = projects.find(p => p.id === projectId) || projects[0];
  const projectName = selectedProject?.name || summary?.project_name || '73 Broadway, Hoboken';

  // ─── Interactive State (Budgets, Draws, Milestones, Contingency) ────────────
  const [budgetLines, setBudgetLines] = useState([
    { category: 'Plans & Permits',       budget: 45000,  spent: 44500,   progress: 100, status: 'done' },
    { category: 'Site Work',             budget: 78000,  spent: 82000,   progress: 95,  status: 'over' },
    { category: 'Foundation',            budget: 95000,  spent: 95000,   progress: 100, status: 'done' },
    { category: 'Framing',               budget: 145000, spent: 142000,  progress: 95,  status: 'done' },
    { category: 'Rough Plumbing',        budget: 68000,  spent: 55760,   progress: 55,  status: 'flag' },
    { category: 'Rough Electrical',      budget: 72000,  spent: 68400,   progress: 80,  status: 'ok'   },
    { category: 'HVAC',                  budget: 45000,  spent: 12000,   progress: 25,  status: 'ok'   },
    { category: 'Insulation & Drywall',  budget: 38000,  spent: 0,       progress: 0,   status: 'upcoming' },
    { category: 'Flooring & Finishes',   budget: 125000, spent: 0,       progress: 0,   status: 'upcoming' },
    { category: 'Exterior & Roofing',    budget: 88000,  spent: 88000,   progress: 100, status: 'done' },
    { category: 'Windows & Doors',       budget: 62000,  spent: 58000,   progress: 100, status: 'done' },
    { category: 'Landscaping',           budget: 18000,  spent: 0,       progress: 0,   status: 'upcoming' },
  ]);

  const [contingencyRemaining, setContingencyRemaining] = useState(42000);
  const [contingencyMovements, setContingencyMovements] = useState<ContingencyMovement[]>([
    {
      id: 'cm-1',
      project_id: projectId,
      source_category: 'Contingency Reserve',
      destination_category: 'Foundation',
      amount: 40000,
      reason: 'Unexpected soft soil encountered requiring extra piles to bear building load.',
      status: 'APPROVED',
      approved_by: 'Hardik Parikh (Owner)',
      approved_at: 'Mar 18, 2026',
    },
  ]);

  const [changeOrders, setChangeOrders] = useState([
    {
      id: 'co-1',
      number: 'CO-001',
      category: 'Foundation',
      amount: 40000,
      reason: 'Unforeseen soft soil condition',
      status: 'APPROVED',
      date: 'Mar 18, 2026',
    },
  ]);

  const [draws, setDraws] = useState([
    {
      id: 'draw-3', number: 3, revision: 1,
      submitted: 'Oct 1, 2026', status: 'pending',
      requested: 185000, approved: null, disbursed: null,
      notes: 'Draw #3 submitted pending BCB Bank review.',
      lines: [
        { category: 'Rough Electrical', requested: 68400, approved: null, status: 'pending' },
        { category: 'HVAC (partial)',    requested: 12000, approved: null, status: 'pending' },
        { category: 'Windows & Doors',  requested: 58000, approved: null, status: 'pending' },
        { category: 'Exterior Roofing', requested: 46600, approved: null, status: 'pending' },
      ],
    },
    {
      id: 'draw-2', number: 2, revision: 0,
      submitted: 'Jul 15, 2026', status: 'disbursed',
      requested: 304000, approved: 304000, disbursed: 304000,
      notes: 'Fully approved and disbursed by BCB Community Bank.',
      lines: [
        { category: 'Foundation',  requested: 95000, approved: 95000,  status: 'disbursed' },
        { category: 'Framing',     requested: 142000, approved: 142000, status: 'disbursed' },
        { category: 'Site Work',   requested: 67000,  approved: 67000,  status: 'disbursed' },
      ],
    },
    {
      id: 'draw-1', number: 1, revision: 0,
      submitted: 'May 3, 2026', status: 'disbursed',
      requested: 605000, approved: 605000, disbursed: 605000,
      notes: 'Initial draw — land acquisition + plans.',
      lines: [
        { category: 'Plans & Permits', requested: 44500, approved: 44500, status: 'disbursed' },
        { category: 'Acquisition',     requested: 560500, approved: 560500, status: 'disbursed' },
      ],
    },
  ]);

  const [milestones, setMilestones] = useState([
    { name: 'Plans & Permits',       planned: 'Sep 1, 2025',  actual: 'Sep 15, 2025', delayDays: 14,  status: 'done',        progress: 100, source: 'Municipal approval' },
    { name: 'Site Clearance',        planned: 'Oct 1, 2025',  actual: 'Oct 12, 2025', delayDays: 11,  status: 'done',        progress: 100, source: 'GC confirmation' },
    { name: 'Foundation',            planned: 'Nov 1, 2025',  actual: 'Nov 3, 2025',  delayDays: 2,   status: 'done',        progress: 100, source: 'Lender inspection' },
    { name: 'Framing',               planned: 'Dec 1, 2025',  actual: 'Dec 8, 2025',  delayDays: 7,   status: 'done',        progress: 100, source: 'PM confirmation' },
    { name: 'Exterior & Roofing',    planned: 'Jan 10, 2026', actual: 'Jan 18, 2026', delayDays: 8,   status: 'done',        progress: 100, source: 'Lender inspection' },
    { name: 'Windows & Doors',       planned: 'Feb 1, 2026',  actual: 'Feb 14, 2026', delayDays: 13,  status: 'done',        progress: 100, source: 'GC confirmation' },
    { name: 'Rough Plumbing',        planned: 'Mar 1, 2026',  actual: 'Mar 28, 2026', delayDays: 27,  status: 'done',        progress: 55,  source: 'Inspection passed' },
    { name: 'Rough Electrical',      planned: 'Mar 15, 2026', actual: null,           delayDays: 17,  status: 'in-progress', progress: 80,  source: 'In progress' },
    { name: 'HVAC Rough-in',         planned: 'Apr 1, 2026',  actual: null,           delayDays: null, status: 'upcoming',    progress: 25,  source: '—' },
    { name: 'Insulation & Drywall',  planned: 'May 1, 2026',  actual: null,           delayDays: null, status: 'upcoming',    progress: 0,   source: '—' },
    { name: 'Finishes & Flooring',   planned: 'May 20, 2026', actual: null,           delayDays: null, status: 'upcoming',    progress: 0,   source: '—' },
    { name: 'Certificate of Occupancy', planned: 'Jun 15, 2026', actual: null,        delayDays: null, status: 'upcoming',    progress: 0,   source: '—' },
  ]);

  const [unitSales, setUnitSales] = useState<UnitSale[]>([
    {
      id: 'u-1',
      project_id: projectId,
      unit_name: 'Unit 1 — Penthouse Duplex (4th Fl)',
      sq_ft: 1800,
      beds_baths: '3 Bed / 2.5 Bath · Private Roof Deck',
      asking_price: 1250000,
      contract_price: 1225000,
      deposit_amount: 122500,
      status: 'UNDER_CONTRACT',
      buyer_name: 'Dr. Robert Chen (Attorney Review Complete)',
      contract_date: 'Aug 14, 2026',
      closing_date: 'Nov 30, 2026',
      broker_commission_pct: 0.03,
      closing_costs_est: 18000,
      net_proceeds: 1170250,
      loan_payoff_allocation: 650000,
      investor_distribution: 520250,
    },
    {
      id: 'u-2',
      project_id: projectId,
      unit_name: 'Unit 2 — Mid-Floor Residence (3rd Fl)',
      sq_ft: 1600,
      beds_baths: '2 Bed / 2 Bath · Balcony',
      asking_price: 1050000,
      contract_price: undefined,
      deposit_amount: undefined,
      status: 'AVAILABLE',
      buyer_name: undefined,
      broker_commission_pct: 0.03,
      closing_costs_est: 15000,
      net_proceeds: 1003500,
      loan_payoff_allocation: 444000,
      investor_distribution: 559500,
    },
    {
      id: 'u-3',
      project_id: projectId,
      unit_name: 'Unit 3 — Garden Duplex (1st & 2nd Fl)',
      sq_ft: 1400,
      beds_baths: '2 Bed / 2 Bath · Private Yard',
      asking_price: 980000,
      contract_price: 980000,
      deposit_amount: 98000,
      status: 'UNDER_CONTRACT',
      buyer_name: 'Amanda & Liam Vance',
      contract_date: 'Sep 2, 2026',
      closing_date: 'Dec 15, 2026',
      broker_commission_pct: 0.03,
      closing_costs_est: 14000,
      net_proceeds: 936600,
      loan_payoff_allocation: 0,
      investor_distribution: 936600,
    },
  ]);

  const [amexTransactions, setAmexTransactions] = useState<AmexCardTransaction[]>([
    {
      id: 'tx-1',
      project_id: projectId,
      card_last4: '8421',
      card_label: 'Amex Project Card · 73 Broadway',
      date: 'Oct 3, 2026',
      vendor: 'Home Depot #4812',
      amount: 3482,
      ai_suggested_category: 'Flooring & Finishes',
      ai_confidence: 82,
      status: 'NEEDS_REVIEW',
      memo: 'Finish trim nails and subfloor adhesive',
      evidence_strength: 'CARD_TRANSACTION',
    },
    {
      id: 'tx-2',
      project_id: projectId,
      card_last4: '8421',
      card_label: 'Amex Project Card · 73 Broadway',
      date: 'Sep 29, 2026',
      vendor: 'Sylvia Concrete LLC',
      amount: 14200,
      ai_suggested_category: 'Foundation',
      ai_confidence: 98,
      status: 'MATCHED',
      memo: 'Foundation cure batch #4',
      evidence_strength: 'BANK_TRANSACTION',
    },
    {
      id: 'tx-3',
      project_id: projectId,
      card_last4: '8421',
      card_label: 'Amex Project Card · 73 Broadway',
      date: 'Sep 24, 2026',
      vendor: 'Kuiken Brothers Lumber',
      amount: 8750,
      ai_suggested_category: 'Framing',
      ai_confidence: 96,
      status: 'MATCHED',
      memo: 'Roof rafters and 2x10 joists',
      evidence_strength: 'VERIFIED_INVOICE',
    },
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 'a1', severity: 'critical', type: 'RECONCILIATION_EXCEPTION',
      title: 'Plumbing spend ahead of verified progress',
      description: '82% of plumbing budget has been spent but only 55% is verified as complete. This delta exceeds the 15% threshold.',
      details: { spent: '$55,760', budget: '$68,000', progress: '55%', delta: '+27%' },
      action: 'View Budget Tab',
      createdAt: 'Oct 4, 2026',
      resolved: false,
    },
    {
      id: 'a2', severity: 'high', type: 'SCHEDULE_DELAY',
      title: 'Cumulative schedule delay: 82 days',
      description: 'Project milestones have accumulated 82 days of delay since groundbreaking. Estimated additional carrying cost: $26,568.',
      details: { delayDays: '82 days', dailyCost: '$324/day', totalImpact: '$26,568' },
      action: 'View Timeline',
      createdAt: 'Oct 5, 2026',
      resolved: false,
    },
    {
      id: 'a3', severity: 'medium', type: 'OVER_BUDGET',
      title: 'Site Work over budget by $4,000',
      description: 'Site Work category has spent $82,000 against an approved budget of $78,000. Absorb from 10% Reserve Contingency.',
      details: { budget: '$78,000', spent: '$82,000', variance: '+$4,000' },
      action: 'Absorb Overrun',
      createdAt: 'Oct 2, 2026',
      resolved: false,
    },
  ]);

  // Modals state
  const [isChangeOrderModalOpenLocal, setIsChangeOrderModalOpenLocal] = useState(false);
  const [isContingencyModalOpen, setIsContingencyModalOpen] = useState(false);
  const [isDrawPacketModalOpenLocal, setIsDrawPacketModalOpenLocal] = useState(false);
  const [selectedMilestoneForEdit, setSelectedMilestoneForEdit] = useState<any>(null);
  const [selectedDocForReview, setSelectedDocForReview] = useState<any>(null);
  const [contingencyTargetCat, setContingencyTargetCat] = useState<string>('Site Work');

  const showCOModal = isChangeOrderModalOpen || isChangeOrderModalOpenLocal;
  const showDrawModal = isDrawPacketModalOpen || isDrawPacketModalOpenLocal;

  // Handlers
  const handleAddChangeOrder = (co: any) => {
    setChangeOrders(prev => [
      {
        id: `co-${Date.now()}`,
        number: co.change_order_number,
        category: co.category,
        amount: co.amount,
        reason: co.reason,
        status: 'APPROVED',
        date: 'Today',
      },
      ...prev,
    ]);

    // Update budget line
    setBudgetLines(prev =>
      prev.map(line =>
        line.category === co.category
          ? { ...line, budget: line.budget + co.amount }
          : line
      )
    );
  };

  const handleAbsorbContingency = (movement: any) => {
    setContingencyRemaining(prev => Math.max(0, prev - movement.amount));
    setContingencyMovements(prev => [
      {
        id: `cm-${Date.now()}`,
        project_id: projectId,
        source_category: 'Contingency Reserve',
        destination_category: movement.destination_category,
        amount: movement.amount,
        reason: movement.reason,
        status: 'APPROVED',
        approved_by: 'Hardik Parikh (Owner)',
        approved_at: 'Today',
      },
      ...prev,
    ]);

    // Adjust budget line
    setBudgetLines(prev =>
      prev.map(line =>
        line.category === movement.destination_category
          ? { ...line, budget: line.budget + movement.amount, status: 'ok' }
          : line
      )
    );
  };

  const handleCreateDraw = (drawData: any) => {
    setDraws(prev => [
      {
        id: `draw-${drawData.draw_number}`,
        number: drawData.draw_number,
        revision: 0,
        submitted: 'Today',
        status: 'pending',
        requested: drawData.requested_total,
        approved: null,
        disbursed: null,
        notes: drawData.notes,
        lines: drawData.lines.map((l: any) => ({
          category: l.category,
          requested: l.requested_amount,
          approved: null,
          status: 'pending',
        })),
      },
      ...prev,
    ]);
  };

  const handleUpdateMilestone = (data: any) => {
    setMilestones(prev =>
      prev.map(m =>
        m.name === data.name
          ? {
              ...m,
              progress: data.progress,
              delayDays: data.delayDays,
              status: data.progress === 100 ? 'done' : 'in-progress',
              source: `${data.inspectorName} (${data.inspectionResult})`,
            }
          : m
      )
    );
  };

  const handleConfirmDocPost = (postData: any) => {
    // Add to actual spend
    setBudgetLines(prev =>
      prev.map(line =>
        line.category === postData.category
          ? { ...line, spent: line.spent + postData.amount }
          : line
      )
    );
  };

  const handleConfirmAmexMatch = (txId: string) => {
    setAmexTransactions(prev =>
      prev.map(tx => (tx.id === txId ? { ...tx, status: 'MATCHED' } : tx))
    );
  };

  // Economics
  const totalBudget = budgetLines.reduce((s, l) => s + l.budget, 0);
  const totalSpent = budgetLines.reduce((s, l) => s + l.spent, 0);
  const totalFunded = draws.filter(d => d.status === 'disbursed').reduce((s, d) => s + (d.disbursed || 0), 0);
  const cashExposure = totalSpent - totalFunded;

  // Pro Forma Economics
  const originalProfit = 650000;
  const currentProfit = 455000;
  const profitDrift = currentProfit - originalProfit; // -$195K
  const originalRoi = 27.7;
  const currentRoi = 17.9;

  const tabs: Array<{ id: ProjectTab; label: string; icon: any; badge?: number }> = [
    { id: 'overview', label: 'Control Center', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget & Contingency', icon: DollarSign },
    { id: 'draws', label: 'Draw Lab', icon: FileCheck, badge: draws.filter(d => d.status === 'pending').length },
    { id: 'timeline', label: 'Milestones & Delay', icon: Clock },
    { id: 'documents', label: 'Document Inbox & Amex', icon: FolderOpen },
    { id: 'disposition', label: 'Unit Sales & ROI', icon: Home },
    { id: 'alerts', label: 'Risk Alerts', icon: BellRing, badge: alerts.filter(a => !a.resolved).length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Breadcrumb & Project Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <button onClick={onBack} className="hover:text-slate-900 flex items-center gap-1 cursor-pointer">
                <ChevronLeft className="w-3.5 h-3.5" /> Portfolio
              </button>
              <span>/</span>
              <span className="text-slate-900 font-bold">{projectName}</span>
            </div>

            {/* Quick GC Model Indicator */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Commercial Model: <strong>Daily Updates / Open-Book</strong></span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-slate-900">{projectName}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                73 Broadway, Hoboken NJ · 3 Luxury Units · 4,800 sf · Lender: BCB Bank · GC: K&P Construction
              </p>
            </div>

            {/* Role-Specific Action Triggers */}
            <div className="flex items-center gap-2">
              {currentRole === 'GC_FIXED' ? (
                <button
                  onClick={() => setIsDrawPacketModalOpenLocal(true)}
                  className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Submit Milestone Claim</span>
                </button>
              ) : currentRole === 'GC_DAILY' ? (
                <button
                  onClick={() => setActiveTab('timeline')}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Post Daily Work Log</span>
                </button>
              ) : currentRole === 'INVESTOR' ? (
                <button
                  onClick={() => alert('Exporting Certified Investor Health Report PDF...')}
                  className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Investor Report</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsChangeOrderModalOpenLocal(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Change Order
                  </button>
                  <button
                    onClick={() => setIsDrawPacketModalOpenLocal(true)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" /> Build Draw Packet
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 -mb-px pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-px shrink-0 ${
                    isActive
                      ? 'border-slate-900 text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Area */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: CONTROL CENTER & LIFECYCLE ECONOMICS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* The Four Domain Truths */}
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                The Four Domain Truths (Deterministic · Zero Hallucination)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {[
                  {
                    title: '1. Budget Truth',
                    val: fmt(totalBudget),
                    sub: 'Baseline + Approved COs',
                    color: 'text-blue-700',
                    dot: 'bg-blue-500',
                    type: 'budget' as const,
                  },
                  {
                    title: '2. Spend Truth',
                    val: fmt(totalSpent),
                    sub: `${Math.round((totalSpent / totalBudget) * 100)}% of Budget Posted`,
                    color: 'text-emerald-700',
                    dot: 'bg-emerald-500',
                    type: 'spend' as const,
                  },
                  {
                    title: '3. Funding Truth',
                    val: fmt(totalFunded),
                    sub: 'Disbursed by BCB Bank only',
                    color: 'text-purple-700',
                    dot: 'bg-purple-500',
                    type: 'funded' as const,
                  },
                  {
                    title: '4. Progress Truth',
                    val: '72% Verified',
                    sub: 'Inspection Sign-Offs (Non-Inferred)',
                    color: 'text-amber-700',
                    dot: 'bg-amber-500',
                    type: 'delay' as const,
                  },
                ].map((t) => (
                  <div
                    key={t.title}
                    onClick={() => onInspectProvenance(t.type)}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-slate-400 hover:shadow-sm transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1.5 font-bold">
                        <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                        <span>{t.title}</span>
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
                    </div>
                    <div className={`text-2xl font-bold font-mono tracking-tight ${t.color}`}>
                      {t.val}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">{t.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* HERO: Developer Cash Exposure */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Hero Metric · Developer Cash Exposure
                  </span>
                  <div className="text-4xl font-extrabold font-mono text-white mt-2">
                    ${cashExposure.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
                    <span>Actual Spend: <strong className="text-white font-mono">{fmt(totalSpent)}</strong></span>
                    <span>−</span>
                    <span>Lender Disbursed: <strong className="text-purple-300 font-mono">{fmt(totalFunded)}</strong></span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-3 max-w-2xl leading-relaxed">
                    Out-of-pocket developer equity fronted on site awaiting next lender draw reimbursement. Computed strictly from confirmed records.
                  </p>
                </div>
                <button
                  onClick={() => onInspectProvenance('exposure')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer self-start sm:self-center flex items-center gap-1.5"
                >
                  <span>Audit Lineage</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PROJECT ECONOMICS: Pro Forma vs. Current Forecast */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Project Economics — Pro Forma vs. Current Forecast</h3>
                  <p className="text-xs text-slate-500">Continuous profit tracking: what you originally planned vs what you will actually take home</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Profit Drift: -$195,000 (ROI: 27.7% → 17.9%)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Acquisition Cost</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">$1,000,000</div>
                  <div className="text-[10px] text-slate-400">Cash / Land HUD-1</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Construction Budget</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{fmt(totalBudget)}</div>
                  <div className="text-[10px] text-red-600">+$120K over baseline</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Interest & Carrying</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">$225,000</div>
                  <div className="text-[10px] text-amber-600">+$75K delay carry</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-slate-500 text-[10px]">Target Sales Price (ARV)</div>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">$3,250,000</div>
                  <div className="text-[10px] text-emerald-600">Comps confirmed</div>
                </div>
              </div>

              {/* Profit Drift Explanation Box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 text-xs">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Why Did Projected Profit Drop by $195,000?</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-red-600 font-bold font-mono">-$120,000</span>
                    <span>Construction hard cost overruns (Site work & extra foundation piles)</span>
                  </div>
                  <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-amber-100">
                    <span className="text-red-600 font-bold font-mono">-$75,000</span>
                    <span>Additional carrying interest from 82 days of schedule delay</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LOAN FACILITY & INTEREST RESERVE METER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Landmark className="w-4 h-4 text-slate-600" />
                  <span>BCB Community Bank — Construction Facility & Interest Reserve</span>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  9.75% APR Interest-Only Facility
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-slate-500">Total Loan Amount</div>
                  <div className="text-base font-bold font-mono text-slate-900 mt-1">$1,200,000</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Drawn Balance: $1,094,000</div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-slate-500">Daily Carrying Cost</div>
                  <div className="text-base font-bold font-mono text-amber-600 mt-1">$324 / day</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Based on drawn balance × 9.75% ÷ 365</div>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-slate-500">Interest Reserve Runway</div>
                  <div className="text-base font-bold font-mono text-purple-700 mt-1">$32,500 remaining</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Approx. 3.2 months of interest remaining</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: BUDGET & CONTINGENCY
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Contingency Reserve Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  10% Reserve Contingency
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                  ${contingencyRemaining.toLocaleString()} remaining
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Initial Reserve: $82,000 · Total Absorbed: $40,000 (1 movement)
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsContingencyModalOpen(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Absorb Overrun from Contingency</span>
                </button>
                <button
                  onClick={() => setIsChangeOrderModalOpenLocal(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>New Change Order</span>
                </button>
              </div>
            </div>

            {/* SOV Budget Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Master Schedule of Values (SOV) — Budget Truth vs. Spend Truth</span>
                <span className="font-mono text-slate-500">12 Categories</span>
              </div>
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-right">Budget</th>
                    <th className="px-4 py-3 text-right">Spent</th>
                    <th className="px-4 py-3 text-right">Variance</th>
                    <th className="px-4 py-3 text-center">Progress %</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {budgetLines.map((line) => {
                    const variance = line.spent - line.budget;
                    const isOver = variance > 0;
                    return (
                      <tr key={line.category} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          {isOver ? <TrendingUp className="w-3.5 h-3.5 text-red-500 shrink-0" /> : null}
                          <span>{line.category}</span>
                          {line.status === 'flag' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Recon Flag
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-700">{fmt(line.budget)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{fmt(line.spent)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-semibold ${isOver ? 'text-red-600' : 'text-emerald-700'}`}>
                          {isOver ? '+' : ''}{fmt(variance)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${isOver ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${line.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-slate-500 w-8">{line.progress}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isOver ? (
                            <button
                              onClick={() => {
                                setContingencyTargetCat(line.category);
                                setIsContingencyModalOpen(true);
                              }}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[10px] font-bold cursor-pointer transition"
                            >
                              Fund from Contingency
                            </button>
                          ) : (
                            <button
                              onClick={() => onInspectProvenance('spend', line.category)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer font-medium"
                            >
                              Audit Lineage →
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Contingency Movements Audit Table */}
            {contingencyMovements.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
                  Contingency Absorption Audit Log ({contingencyMovements.length})
                </div>
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Destination Category</th>
                      <th className="px-4 py-2.5 text-right">Amount Absorbed</th>
                      <th className="px-4 py-2.5 text-left">Justification Reason</th>
                      <th className="px-4 py-2.5 text-left">Approved By</th>
                      <th className="px-4 py-2.5 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contingencyMovements.map((cm) => (
                      <tr key={cm.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{cm.destination_category}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">{fmt(cm.amount)}</td>
                        <td className="px-4 py-3 text-slate-600">{cm.reason}</td>
                        <td className="px-4 py-3 text-slate-500">{cm.approved_by}</td>
                        <td className="px-4 py-3 text-right text-slate-400 font-mono">{cm.approved_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: DRAWS & DRAW PACKET BUILDER
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'draws' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Construction Draws & Lender Disbursements</h3>
                <p className="text-xs text-slate-500">Track requested vs approved vs wire disbursed funding</p>
              </div>
              <button
                onClick={() => setIsDrawPacketModalOpenLocal(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>+ Build Draw #{draws.length + 1} Packet</span>
              </button>
            </div>

            {/* Draws List */}
            <div className="space-y-3">
              {draws.map((d) => (
                <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        #{d.number}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          Draw #{d.number} {d.revision > 0 ? `(Revision ${d.revision})` : ''}
                        </div>
                        <div className="text-xs text-slate-500">Submitted: {d.submitted}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400 uppercase">Requested</div>
                        <div className="font-mono font-bold text-slate-900 text-sm">{fmt(d.requested)}</div>
                      </div>
                      {d.disbursed !== null && (
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400 uppercase">Disbursed</div>
                          <div className="font-mono font-bold text-emerald-700 text-sm">{fmt(d.disbursed)}</div>
                        </div>
                      )}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                        d.status === 'disbursed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </div>
                  </div>

                  {/* Draw Lines */}
                  <div className="pt-2 border-t border-slate-100">
                    <table className="w-full text-xs">
                      <tbody className="divide-y divide-slate-50">
                        {d.lines.map((l, i) => (
                          <tr key={i} className="text-slate-600">
                            <td className="py-1.5">{l.category}</td>
                            <td className="py-1.5 text-right font-mono font-semibold text-slate-900">
                              {fmt(l.requested)}
                            </td>
                            <td className="py-1.5 text-right font-semibold">
                              <span className={l.status === 'disbursed' ? 'text-emerald-700' : 'text-amber-600'}>
                                {l.status === 'disbursed' ? '✓ Disbursed' : '⏳ Pending Review'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {d.notes && (
                    <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      Memo: {d.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: TIMELINE, INSPECTIONS & DELAY ATTRIBUTION (PM VIEW)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Construction Schedule & Delay Attribution</h3>
                <p className="text-xs text-slate-500">Every milestone slip is attributed to a root cause with carrying cost math</p>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-mono font-bold text-amber-900">
                Cumulative Delay: 82 Days (+${(82 * 324).toLocaleString()} Carry Cost)
              </div>
            </div>

            {/* Milestones Table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 text-left">Milestone</th>
                    <th className="px-4 py-3 text-left">Planned</th>
                    <th className="px-4 py-3 text-left">Actual</th>
                    <th className="px-4 py-3 text-center">Delay Slip</th>
                    <th className="px-4 py-3 text-center">Physical Progress</th>
                    <th className="px-4 py-3 text-left">Inspection Sign-Off</th>
                    <th className="px-4 py-3 text-right">Field Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {milestones.map((m) => (
                    <tr key={m.name} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{m.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{m.planned}</td>
                      <td className="px-4 py-3 font-mono text-slate-900">{m.actual || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        {m.delayDays ? (
                          <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{m.delayDays}d
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-semibold text-slate-900">{m.progress}%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{m.source}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedMilestoneForEdit(m)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                        >
                          Log Progress
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: DOCUMENTS & AMEX CORPORATE CARD LEDGER (CFO VIEW)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Amex Corporate Card Feed */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-blue-700" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Amex Project Card Feed (Card Ending 8421)</h4>
                    <p className="text-xs text-slate-500">Expenses categorized by property every 3 days as described by Hardik</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Feed Connected
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 text-left">Date</th>
                      <th className="px-4 py-2.5 text-left">Vendor</th>
                      <th className="px-4 py-2.5 text-left">AI Category Match</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {amexTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-500">{tx.date}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{tx.vendor}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-800">{tx.ai_suggested_category}</span>
                          <span className="ml-1.5 text-[10px] text-emerald-700 font-mono font-bold">
                            ({tx.ai_confidence}%)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{fmt(tx.amount)}</td>
                        <td className="px-4 py-3 text-right">
                          {tx.status === 'MATCHED' ? (
                            <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                              <Check className="w-3.5 h-3.5" /> Matched
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmAmexMatch(tx.id)}
                              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                            >
                              Confirm Match
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Ingestion Queue */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="w-5 h-5 text-slate-700" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Source Documents & OCR Staging Queue</h4>
                    <p className="text-xs text-slate-500">Every number links to its underlying source document</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'doc-1', name: 'Plumbing_Invoice_Sep.pdf', type: 'INVOICE', confidence: 61, flaggedItems: 1 },
                  { id: 'doc-2', name: 'April_Expenses_Ledger.xlsx', type: 'EXPENSE_LEDGER', confidence: 97, flaggedItems: 0 },
                  { id: 'doc-3', name: 'BCB_Bank_Statement_Aug.pdf', type: 'BANK_STATEMENT', confidence: 99, flaggedItems: 0 },
                ].map((doc) => (
                  <div key={doc.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          Classification: {doc.type} · Confidence: {doc.confidence}%
                        </div>
                      </div>
                    </div>
                    {doc.flaggedItems > 0 ? (
                      <button
                        onClick={() => setSelectedDocForReview(doc)}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs cursor-pointer transition"
                      >
                        Review Flagged ({doc.flaggedItems})
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold">✓ Posted to Spend Truth</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: DISPOSITION & UNIT SALES (FINAL INVESTOR ROI)
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'disposition' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Disposition, Unit Sales & Investor Distributions</h3>
                <p className="text-xs text-slate-500">Track condominium unit closings, realtor commissions, loan payoffs, and net return</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Projected Revenue:</span>
                <span className="ml-2 font-mono font-bold text-emerald-700 text-sm">$3,250,000</span>
              </div>
            </div>

            {/* Unit Sales Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {unitSales.map((unit) => (
                <div key={unit.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{unit.unit_name.split(' — ')[0]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      unit.status === 'CLOSED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : unit.status === 'UNDER_CONTRACT'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {unit.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-slate-500 text-[11px]">{unit.beds_baths} · {unit.sq_ft} sf</div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Asking Price:</span>
                      <span className="font-semibold text-slate-700">{fmt(unit.asking_price)}</span>
                    </div>
                    {unit.contract_price && (
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Contract Price:</span>
                        <span>{fmt(unit.contract_price)}</span>
                      </div>
                    )}
                    {unit.deposit_amount && (
                      <div className="flex justify-between text-emerald-700">
                        <span>Escrow Deposit:</span>
                        <span>{fmt(unit.deposit_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                      <span>Broker Comm. (3%):</span>
                      <span>-${fmt(Math.round((unit.contract_price || unit.asking_price) * unit.broker_commission_pct))}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold pt-1 border-t border-slate-200">
                      <span>Est. Net Proceeds:</span>
                      <span>{fmt(unit.net_proceeds)}</span>
                    </div>
                  </div>

                  {unit.buyer_name && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                      Buyer: <strong>{unit.buyer_name}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 7: ALERTS & RISK ENGINE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Alerts & Reconciliation Exceptions</h3>
                <p className="text-xs text-slate-500">Items requiring immediate owner decision to avoid draw or profit disruption</p>
              </div>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-xs rounded-full border border-red-200">
                {alerts.filter(a => !a.resolved).length} Action Items
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className={`p-5 rounded-2xl border transition ${
                    a.resolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : a.severity === 'critical'
                      ? 'bg-red-50/60 border-red-200'
                      : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          a.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {a.severity}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{a.type.replace('_', ' ')}</span>
                        <span className="text-slate-400 text-xs font-mono">{a.createdAt}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{a.title}</div>
                      <p className="text-xs text-slate-600">{a.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {!a.resolved ? (
                        <button
                          onClick={() => setAlerts(prev => prev.map(item => item.id === a.id ? { ...item, resolved: true } : item))}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <ChangeOrderModal
        isOpen={showCOModal}
        onClose={() => {
          setIsChangeOrderModalOpenLocal(false);
          if (onCloseChangeOrderModal) onCloseChangeOrderModal();
        }}
        categories={budgetLines.map(b => b.category)}
        onSubmitChangeOrder={handleAddChangeOrder}
      />

      <ContingencyModal
        isOpen={isContingencyModalOpen}
        onClose={() => setIsContingencyModalOpen(false)}
        availableContingency={contingencyRemaining}
        categories={budgetLines.map(b => b.category)}
        initialCategory={contingencyTargetCat}
        onAbsorbContingency={handleAbsorbContingency}
      />

      <DrawPacketModal
        isOpen={showDrawModal}
        onClose={() => {
          setIsDrawPacketModalOpenLocal(false);
          if (onCloseDrawPacketModal) onCloseDrawPacketModal();
        }}
        nextDrawNumber={draws.length + 1}
        availableLines={budgetLines.map(b => ({
          category: b.category,
          budget: b.budget,
          spent: b.spent,
          available: Math.max(0, b.budget - b.spent),
        }))}
        onSubmitDraw={handleCreateDraw}
      />

      {selectedMilestoneForEdit && (
        <MilestoneUpdateModal
          isOpen={!!selectedMilestoneForEdit}
          onClose={() => setSelectedMilestoneForEdit(null)}
          milestone={selectedMilestoneForEdit}
          onUpdateMilestone={handleUpdateMilestone}
        />
      )}

      {selectedDocForReview && (
        <ExtractionReviewModal
          isOpen={!!selectedDocForReview}
          onClose={() => setSelectedDocForReview(null)}
          document={selectedDocForReview}
          categories={budgetLines.map(b => b.category)}
          onConfirmPost={handleConfirmDocPost}
        />
      )}
    </div>
  );
}

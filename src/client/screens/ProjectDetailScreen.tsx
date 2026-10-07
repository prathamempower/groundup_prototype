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
  UserCheck,
  Lock
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
import { hasPermission } from '../../shared/rbac/matrix';
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
  onTabChange?: (tab: ProjectTab) => void;
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
  onTabChange,
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

  const [changeOrders, setChangeOrders] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(`groundup_change_orders_${projectId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'co-1',
        number: 'CO-001',
        category: 'Foundation',
        sub_section: 'Substructure & Pile Reinforcement',
        cost_code: '03-100',
        amount: 40000,
        reason: 'Unforeseen soft soil condition',
        description: 'Engineered grade beams and extra helical piles required by structural engineer.',
        status: 'APPROVED',
        visible_to_gc: true,
        gc_notes: 'Owner approved. GC authorized to proceed with foundation underpinning.',
        date: 'Mar 18, 2026',
        is_other: false,
      },
      {
        id: 'co-other-1',
        number: 'CO-002',
        category: 'Municipal Utility Easement Relocation',
        sub_section: 'Off-Site Civil & Utility Trenching',
        cost_code: '02-310',
        amount: 18500,
        reason: 'Township Utility Conflict',
        description: 'PSE&G mandated emergency lateral line relocation across west boundary easement.',
        status: 'APPROVED',
        visible_to_gc: true,
        gc_notes: 'Approved lateral rework. GC coordinated with municipal inspectors.',
        date: 'Apr 02, 2026',
        is_other: true,
      },
    ];
  });

  // Inline "Add New Order" Sub-Section State
  const [showInlineAddOrder, setShowInlineAddOrder] = useState(false);
  const [inlineScopeType, setInlineScopeType] = useState<'standard' | 'other'>('other');
  const [inlineCategory, setInlineCategory] = useState('Framing');
  const [inlineCustomCategory, setInlineCustomCategory] = useState('');
  const [inlineSubSection, setInlineSubSection] = useState('');
  const [inlineCostCode, setInlineCostCode] = useState('');
  const [inlineAmount, setInlineAmount] = useState('18500');
  const [inlineReason, setInlineReason] = useState('UNFORESEEN_SITE_CONDITION');
  const [inlineCustomReason, setInlineCustomReason] = useState('');
  const [inlineDesc, setInlineDesc] = useState('');
  const [inlineVisibleToGC, setInlineVisibleToGC] = useState(true);
  const [inlineGcNotes, setInlineGcNotes] = useState('Approved by Owner. GC authorized to proceed with trade work.');
  const [coFeedbackToast, setCoFeedbackToast] = useState<string | null>(null);

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
    const isOther = co.category === '__OTHER__' || !budgetLines.some(b => b.category === co.category) || !!co.is_other;
    const finalCategory = (co.category === '__OTHER__' ? (co.customCategory || 'Other Scope / Custom Order') : co.category) || 'General Scope';
    const amountVal = Number(co.amount) || 0;

    const newOrder = {
      id: `co-${Date.now()}`,
      number: co.change_order_number || `CO-00${changeOrders.length + 1}`,
      category: finalCategory,
      sub_section: co.sub_section || '',
      cost_code: co.cost_code || '',
      amount: amountVal,
      reason: co.reason || 'Contract Scope Adjustment',
      custom_reason: co.custom_reason || '',
      description: co.description || '',
      status: 'APPROVED',
      visible_to_gc: co.visible_to_gc !== false,
      gc_notes: co.gc_notes || 'Approved by Owner. GC authorized to proceed.',
      date: 'Today',
      is_other: isOther,
      projectId: projectId,
    };

    setChangeOrders(prev => {
      const next = [newOrder, ...prev];
      try {
        localStorage.setItem(`groundup_change_orders_${projectId}`, JSON.stringify(next));
        const allCOs = JSON.parse(localStorage.getItem('groundup_all_change_orders') || '[]');
        localStorage.setItem('groundup_all_change_orders', JSON.stringify([newOrder, ...allCOs.filter((x: any) => x.id !== newOrder.id)]));
        window.dispatchEvent(new Event('groundup_co_updated'));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    // Update or append budget line
    setBudgetLines(prev => {
      const exists = prev.some(line => line.category === finalCategory);
      if (exists) {
        return prev.map(line =>
          line.category === finalCategory
            ? { ...line, budget: line.budget + amountVal }
            : line
        );
      } else {
        return [
          ...prev,
          {
            category: finalCategory,
            budget: amountVal,
            spent: 0,
            progress: 0,
            status: 'upcoming',
          }
        ];
      }
    });

    const gcTargetName = selectedProject?.gc_name || 'General Contractor';
    setCoFeedbackToast(
      newOrder.visible_to_gc
        ? `Order #${newOrder.number} submitted! Budget updated & showed to ${gcTargetName}.`
        : `Order #${newOrder.number} submitted & budget updated.`
    );
    setTimeout(() => setCoFeedbackToast(null), 5000);
  };

  const handleInlineSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(inlineAmount) || 0;
    if (parsedAmount <= 0) return;

    const isOtherScope = inlineScopeType === 'other';
    const categoryName = isOtherScope
      ? (inlineCustomCategory.trim() || 'Other Scope / Custom Trade')
      : inlineCategory;

    handleAddChangeOrder({
      change_order_number: `CO-00${changeOrders.length + 1}`,
      category: categoryName,
      sub_section: inlineSubSection.trim() || undefined,
      cost_code: inlineCostCode.trim() || undefined,
      amount: parsedAmount,
      description: inlineDesc.trim() || (isOtherScope ? 'Supplemental trade order approved by Owner.' : 'Standard scope revision approved by Owner.'),
      budget_impact: true,
      reason: inlineReason === 'OTHER' ? (inlineCustomReason.trim() || 'Other Scope') : inlineReason,
      custom_reason: inlineCustomReason,
      visible_to_gc: inlineVisibleToGC,
      gc_notes: inlineGcNotes,
      is_other: isOtherScope,
    });

    // Reset inline form
    setInlineCustomCategory('');
    setInlineSubSection('');
    setInlineCostCode('');
    setInlineAmount('18500');
    setInlineDesc('');
    setShowInlineAddOrder(false);
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

            {/* Role-Specific Action Triggers (Strictly Gated by RBAC) */}
            <div className="flex items-center gap-2">
              {hasPermission(currentRole, 'milestone_claim:submit') && (
                <button
                  onClick={() => setIsDrawPacketModalOpenLocal(true)}
                  className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Submit Milestone Claim</span>
                </button>
              )}

              {hasPermission(currentRole, 'field_log:create') && (
                <button
                  onClick={() => {
                    setActiveTab('timeline');
                    onTabChange?.('timeline');
                  }}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Post Daily Work Log</span>
                </button>
              )}

              {hasPermission(currentRole, 'change_order:create') && (
                <button
                  onClick={() => setIsChangeOrderModalOpenLocal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Change Order
                </button>
              )}

              {hasPermission(currentRole, 'draw:create_packet') && (
                <button
                  onClick={() => setIsDrawPacketModalOpenLocal(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Build Draw Packet
                </button>
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
                  onClick={() => {
                    setActiveTab(tab.id);
                    onTabChange?.(tab.id);
                  }}
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

            {/* PROJECT ECONOMICS: Pro Forma vs. Current Forecast (Shielded from Field / Contractor Roles) */}
            {hasPermission(currentRole, 'project:view_financials') ? (
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
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2">
                <div className="mx-auto w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Developer Pro Forma Economics Shielded</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Proprietary land acquisition basis, developer equity margins, and pro forma target ROI are confidential to Developer/Owner and CFO roles.
                </p>
              </div>
            )}

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
                {hasPermission(currentRole, 'contingency:manage') && (
                  <button
                    onClick={() => setIsContingencyModalOpen(true)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Absorb Overrun from Contingency</span>
                  </button>
                )}
                {hasPermission(currentRole, 'change_order:create') && (
                  <button
                    onClick={() => setIsChangeOrderModalOpenLocal(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>New Change Order</span>
                  </button>
                )}
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

            {/* Feedback alert toast */}
            {coFeedbackToast && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{coFeedbackToast}</span>
                </div>
                <button onClick={() => setCoFeedbackToast(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                CHANGE ORDERS SECTION: STANDARD & OTHER ORDERS
            ══════════════════════════════════════════════════════════════════ */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
              {/* Change Orders Section Header */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="font-bold text-slate-900 text-sm">Contract Change Orders & Extra Scope Orders</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                      {changeOrders.length} Orders Total
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Formal change requests and scope amendments submitted, approved, and showed to General Contractor ({selectedProject?.gc_name || 'K&P Construction'}).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs flex items-center gap-2 shadow-xs">
                    <span className="text-slate-500">Total Approved:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {fmt(changeOrders.reduce((sum, co) => sum + (Number(co.amount) || 0), 0))}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowInlineAddOrder(!showInlineAddOrder)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showInlineAddOrder ? 'Close Quick Add' : '+ Add New Order (Sub-Section)'}</span>
                  </button>
                  {hasPermission(currentRole, 'change_order:create') && (
                    <button
                      onClick={() => setIsChangeOrderModalOpenLocal(true)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Full Order Builder</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Section: Interactive Quick Add New Order */}
              {showInlineAddOrder && (
                <div className="p-6 bg-slate-50/70 border-b border-slate-200 animate-in fade-in duration-150">
                  <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                          +
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Sub-Section: Add New Contract Order
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Configure category, trade phase sub-section, cost code, and broadcast directly to GC.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                        <button
                          type="button"
                          onClick={() => setInlineScopeType('other')}
                          className={`px-3 py-1 rounded-lg font-bold transition ${
                            inlineScopeType === 'other'
                              ? 'bg-white text-emerald-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Other / New Order Scope
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlineScopeType('standard')}
                          className={`px-3 py-1 rounded-lg font-bold transition ${
                            inlineScopeType === 'standard'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Standard Category Order
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleInlineSubmitOrder} className="space-y-4 text-xs">
                      {/* Category & Scope Type Row */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {inlineScopeType === 'other' ? (
                          <div className="md:col-span-1">
                            <label className="block font-semibold text-slate-700 mb-1">
                              Other Scope / Order Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={inlineCustomCategory}
                              onChange={(e) => setInlineCustomCategory(e.target.value)}
                              placeholder="e.g. Utility Lateral Relocation"
                              className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                              required
                            />
                          </div>
                        ) : (
                          <div className="md:col-span-1">
                            <label className="block font-semibold text-slate-700 mb-1">Budget Category</label>
                            <select
                              value={inlineCategory}
                              onChange={(e) => setInlineCategory(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                            >
                              {budgetLines.map(b => (
                                <option key={b.category} value={b.category}>{b.category}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Sub-Section / Trade Phase
                          </label>
                          <input
                            type="text"
                            value={inlineSubSection}
                            onChange={(e) => setInlineSubSection(e.target.value)}
                            placeholder="e.g. Phase 2 Pier Drillings & Grade Beams"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">
                            Cost Code (CSI / Division)
                          </label>
                          <input
                            type="text"
                            value={inlineCostCode}
                            onChange={(e) => setInlineCostCode(e.target.value)}
                            placeholder="e.g. 02-310 or 03-100"
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Amount & Reason */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Order Amount ($) <span className="text-red-500">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-mono font-bold">$</span>
                            <input
                              type="number"
                              value={inlineAmount}
                              onChange={(e) => setInlineAmount(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Root Cause / Reason</label>
                          <select
                            value={inlineReason}
                            onChange={(e) => setInlineReason(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                          >
                            <option value="UNFORESEEN_SITE_CONDITION">Unforeseen Site Condition (Soil/Rock)</option>
                            <option value="MUNICIPAL_CODE_REVISION">Municipal Code / Inspection Mandate</option>
                            <option value="ARCHITECTURAL_BULLETIN">Architectural Bulletin / Plan Change</option>
                            <option value="OWNER_ELECTED_UPGRADE">Owner Elected Scope Upgrade</option>
                            <option value="VALUE_ENGINEERING">Value Engineering Scope Modification</option>
                            <option value="OTHER">Other Custom Reason...</option>
                          </select>
                        </div>

                        {inlineReason === 'OTHER' ? (
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Specify Other Reason</label>
                            <input
                              type="text"
                              value={inlineCustomReason}
                              onChange={(e) => setInlineCustomReason(e.target.value)}
                              placeholder="e.g. Utility Company Easement Re-route"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                              required
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">Scope Description / Notes</label>
                            <input
                              type="text"
                              value={inlineDesc}
                              onChange={(e) => setInlineDesc(e.target.value)}
                              placeholder="Details and engineer justification..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                            />
                          </div>
                        )}
                      </div>

                      {/* General Contractor Sync Sub-Section */}
                      <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 text-indigo-950 font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={inlineVisibleToGC}
                              onChange={(e) => setInlineVisibleToGC(e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span>Show & Submit Order to General Contractor ({selectedProject?.gc_name || 'K&P Construction'})</span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">
                            GC Live Portal Broadcast
                          </span>
                        </div>
                        {inlineVisibleToGC && (
                          <div>
                            <label className="block text-[11px] font-semibold text-indigo-900 mb-1">
                              Authorization Memo to GC:
                            </label>
                            <input
                              type="text"
                              value={inlineGcNotes}
                              onChange={(e) => setInlineGcNotes(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs text-slate-800"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowInlineAddOrder(false)}
                          className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Submit & Show Order to GC</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* SECTION: OTHER ORDERS & SUPPLEMENTAL TRADE SCOPE */}
              <div className="p-5 border-b border-slate-200 bg-emerald-50/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Other Orders & Supplemental Trade Scope
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {changeOrders.filter(co => co.is_other).length} Other Orders
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Supplemental custom trade scopes & sub-sections added to contract
                  </span>
                </div>

                {changeOrders.filter(co => co.is_other).length === 0 ? (
                  <div className="p-6 bg-white border border-dashed border-slate-300 rounded-xl text-center">
                    <p className="text-xs text-slate-500 font-medium">No custom "Other" orders added yet.</p>
                    <button
                      onClick={() => {
                        setInlineScopeType('other');
                        setShowInlineAddOrder(true);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      + Add New Other Order & Sub-Section
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {changeOrders.filter(co => co.is_other).map((co) => (
                      <div key={co.id} className="bg-white border border-emerald-200/80 rounded-xl p-4 shadow-2xs hover:shadow-xs transition space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900">{co.number}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Other Scope
                              </span>
                              {co.cost_code && (
                                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {co.cost_code}
                                </span>
                              )}
                            </div>
                            <h5 className="font-bold text-slate-900 text-xs mt-1">{co.category}</h5>
                            {co.sub_section && (
                              <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                                <span className="text-slate-400">Sub-Section:</span> {co.sub_section}
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold font-mono text-emerald-700">+{fmt(co.amount)}</span>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{co.date}</div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {co.description || co.reason}
                        </p>

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <span className="text-slate-500">
                            Reason: <strong className="text-slate-700">{co.reason?.replace(/_/g, ' ')}</strong>
                          </span>
                          {co.visible_to_gc ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              <span>Showed to GC</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Internal Owner Only</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: STANDARD CONTRACT CHANGE ORDERS LIST */}
              <div>
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Standard Schedule of Values Change Orders ({changeOrders.filter(co => !co.is_other).length})</span>
                  </div>
                  <span className="text-slate-500 font-normal">Directly updates line item budget truth</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] bg-slate-50/50">
                    <tr>
                      <th className="px-5 py-3 text-left">CO #</th>
                      <th className="px-5 py-3 text-left">Budget Category & Sub-Section</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-left">Root Cause / Justification</th>
                      <th className="px-5 py-3 text-center">GC Sync Status</th>
                      <th className="px-5 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {changeOrders.filter(co => !co.is_other).map((co) => (
                      <tr key={co.id} className="hover:bg-slate-50 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">{co.number}</td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{co.category}</div>
                          {co.sub_section && (
                            <div className="text-[11px] text-slate-500 font-medium">Sub-Section: {co.sub_section}</div>
                          )}
                          {co.cost_code && (
                            <div className="text-[10px] font-mono text-slate-400">Cost Code: {co.cost_code}</div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                          +{fmt(co.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 max-w-xs">
                          <div className="font-medium text-slate-800">{co.reason?.replace(/_/g, ' ')}</div>
                          {co.description && <div className="text-[11px] text-slate-500 truncate">{co.description}</div>}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {co.visible_to_gc ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                              <span>Showed to GC</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Owner Internal</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-slate-400">{co.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              {hasPermission(currentRole, 'draw:create_packet') && (
                <button
                  onClick={() => setIsDrawPacketModalOpenLocal(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Build Draw #{draws.length + 1} Packet</span>
                </button>
              )}
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
                        {hasPermission(currentRole, 'milestone:log_progress') ? (
                          <button
                            onClick={() => setSelectedMilestoneForEdit(m)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold cursor-pointer transition"
                          >
                            Log Progress
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-medium">Read Only</span>
                        )}
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
        gcName={selectedProject?.gc_name || 'K&P Construction'}
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

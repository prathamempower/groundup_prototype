import {
  Project,
  ProjectFourTruthsSummary,
  UserRole,
  ContingencyMovement,
  UnitSale,
  AmexCardTransaction,
} from '../../../shared/types';

export type ProjectTab = 
  | 'overview' 
  | 'acquisition' 
  | 'permits' 
  | 'financing' 
  | 'budget' 
  | 'timeline' 
  | 'draws' 
  | 'disposition' 
  | 'recon' 
  | 'documents' 
  | 'alerts';

export interface ProjectDetailScreenProps {
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

export interface BudgetLineItem {
  category: string;
  budget: number;
  spent: number;
  progress: number;
  status: string;
}

export interface DrawItem {
  id: string;
  number: number;
  revision: number;
  submitted: string;
  status: string;
  requested: number;
  approved: number | null;
  disbursed: number | null;
  notes: string;
  lines: Array<{
    category: string;
    requested: number;
    approved: number | null;
    status: string;
  }>;
}

export interface MilestoneItem {
  name: string;
  planned: string;
  actual: string | null;
  delayDays: number | null;
  status: string;
  progress: number;
  source: string;
}

export interface ChangeOrderItem {
  id: string;
  projectId?: string;
  number: string;
  category: string;
  sub_section: string;
  cost_code: string;
  amount: number;
  reason: string;
  custom_reason?: string;
  description: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  visible_to_gc: boolean;
  gc_notes: string;
  date: string;
  is_other?: boolean;
}

export interface AlertItem {
  id: string;
  severity: string;
  type: string;
  title: string;
  description: string;
  details: Record<string, string>;
  action: string;
  createdAt: string;
  resolved: boolean;
}

export type ProjectAlertItem = AlertItem;

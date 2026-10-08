export interface LoginOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUser?: {
    name: string;
    company: string;
    email: string;
    role?: string;
  };
  onSaveProfileAndProject: (profile: { name: string; company: string }, newProject?: any) => void;
  onOpenReport: (title: string, data: any) => void;
}

export type OnboardingProjectStatus = 'ONGOING' | 'NOT_STARTED' | 'COMPLETED';

export interface OnboardingInvoiceItem {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  inv: string;
  waiver: boolean;
}

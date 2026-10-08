import { Expense } from '../../../shared/types';

export interface InvoiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  actorName: string;
  actorCompany: string;
  onInvoiceChanged: () => void;
}

export interface UploadedDocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'DOC' | 'ZIP' | 'EXCEL' | 'AIA G702' | 'AIA G703';
  vendor: string;
  category: string;
  amount: number;
  waiver: boolean;
  status: 'EXTRACTED' | 'PARSED' | 'PENDING';
}

export const INVOICE_CATEGORIES = [
  'Pre-construction & Permits',
  'Site Work & Demolition',
  'Foundation & Concrete',
  'Framing & Trusses',
  'MEP Rough-in',
  'Drywall & Insulation',
  'Exterior & Roofing',
  'Interior Finishes',
  'Contingency',
];

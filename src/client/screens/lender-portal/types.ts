import { RejectionReasonCode } from '../../../shared/types';

export interface LenderDrawLine {
  id: string;
  category: string;
  requested: number;
  approved: number;
  status: 'APPROVED' | 'PARTIAL' | 'REJECTED';
  rejectionReason: RejectionReasonCode | null;
  lienWaiverPresent: boolean;
  inspectionPassed: boolean;
  spendDocumented: number;
}

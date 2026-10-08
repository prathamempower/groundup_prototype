import { useState } from 'react';
import { RejectionReasonCode } from '../../../shared/types';
import { LenderDrawLine } from './types';

const INITIAL_DRAW_LINES: LenderDrawLine[] = [
  {
    id: 'l-1',
    category: 'Rough Electrical',
    requested: 68400,
    approved: 68400,
    status: 'APPROVED',
    rejectionReason: null,
    lienWaiverPresent: true,
    inspectionPassed: true,
    spendDocumented: 68400,
  },
  {
    id: 'l-2',
    category: 'HVAC (Partial Milestone)',
    requested: 12000,
    approved: 12000,
    status: 'APPROVED',
    rejectionReason: null,
    lienWaiverPresent: true,
    inspectionPassed: true,
    spendDocumented: 12000,
  },
  {
    id: 'l-3',
    category: 'Windows & Doors',
    requested: 58000,
    approved: 58000,
    status: 'APPROVED',
    rejectionReason: null,
    lienWaiverPresent: true,
    inspectionPassed: true,
    spendDocumented: 58000,
  },
  {
    id: 'l-4',
    category: 'Exterior Roofing & Waterproofing',
    requested: 46600,
    approved: 0,
    status: 'REJECTED',
    rejectionReason: 'MISSING_LIEN_WAIVER',
    lienWaiverPresent: false,
    inspectionPassed: true,
    spendDocumented: 46600,
  },
];

export function useLenderPortalState(
  onDisburseFunds?: (drawId: string, amount: number) => void
) {
  const [selectedDrawId] = useState('draw-3');
  const [drawStatus, setDrawStatus] = useState<'pending' | 'approved' | 'disbursed'>('pending');
  const [wireRef, setWireRef] = useState(`WIRE-BCB-${Math.floor(Math.random() * 800000 + 100000)}`);
  const [drawLines, setDrawLines] = useState<LenderDrawLine[]>(INITIAL_DRAW_LINES);

  const totalRequested = drawLines.reduce((s, l) => s + l.requested, 0);
  const totalApproved = drawLines
    .filter((l) => l.status === 'APPROVED' || l.status === 'PARTIAL')
    .reduce((s, l) => s + (l.approved || 0), 0);
  const retainageHoldback = Math.round(totalApproved * 0.10);
  const netWireDisbursement = totalApproved - retainageHoldback;

  const handleUpdateLineStatus = (
    lineId: string,
    status: 'APPROVED' | 'PARTIAL' | 'REJECTED',
    reason?: RejectionReasonCode
  ) => {
    setDrawLines((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        if (status === 'APPROVED') {
          return { ...l, status, approved: l.requested, rejectionReason: null };
        }
        if (status === 'REJECTED') {
          return { ...l, status, approved: 0, rejectionReason: reason || 'MISSING_LIEN_WAIVER' };
        }
        return { ...l, status, approved: Math.round(l.requested * 0.8), rejectionReason: reason || null };
      })
    );
  };

  const handleConfirmDisbursement = () => {
    setDrawStatus('disbursed');
    if (onDisburseFunds) {
      onDisburseFunds(selectedDrawId, netWireDisbursement);
    }
  };

  return {
    selectedDrawId,
    drawStatus,
    wireRef,
    setWireRef,
    drawLines,
    totalRequested,
    totalApproved,
    retainageHoldback,
    netWireDisbursement,
    handleUpdateLineStatus,
    handleConfirmDisbursement,
  };
}

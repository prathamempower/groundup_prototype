import React from 'react';
import { FileCheck, CheckCircle2 } from 'lucide-react';
import { GCMilestoneItem } from '../types';

interface GCClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: GCMilestoneItem[];
  claimMilestoneId: string;
  setClaimMilestoneId: (id: string) => void;
  claimAmount: string;
  setClaimAmount: (amt: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  claimSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const GCClaimModal: React.FC<GCClaimModalProps> = ({
  isOpen,
  onClose,
  milestones,
  claimMilestoneId,
  setClaimMilestoneId,
  claimAmount,
  setClaimAmount,
  notes,
  setNotes,
  claimSuccess,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-slate-900 text-base">Submit Milestone Payment Claim</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Completed Milestone</label>
            <select
              value={claimMilestoneId}
              onChange={(e) => {
                setClaimMilestoneId(e.target.value);
                const selected = milestones.find(m => m.id === e.target.value);
                if (selected) setClaimAmount(selected.contractAmount.toString());
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
            >
              {milestones.filter(m => m.status === 'READY_TO_CLAIM' || m.status === 'UPCOMING').map((m) => (
                <option key={m.id} value={m.id}>{m.name} (${m.contractAmount.toLocaleString()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Claim Amount ($)</label>
            <input
              type="number"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-semibold text-slate-800">Verification Checklist Attached</span>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-700" />
              <span>Geotagged site progress photos attached (4 files)</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-700" />
              <span>Township municipal rough inspection sign-off certificate</span>
            </label>
            <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-indigo-700" />
              <span>Conditional progress lien waiver executed</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Description & Notes to Owner</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5"
            >
              {claimSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Claim Submitted to Owner!</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Payment Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

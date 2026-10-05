// GroundUp AI — GC (Fixed / Milestone Contract) Portal
// Dedicated portal for GCs under lump-sum contracts: milestone claims, completion proof, and change orders

import React, { useState } from 'react';
import { 
  Building2, 
  FileCheck, 
  CheckCircle2, 
  Plus, 
  Camera, 
  Upload, 
  Clock, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Project } from '../../shared/types';

interface GCFixedPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function GCFixedPortalScreen({
  projects,
  selectedProjectId,
}: GCFixedPortalScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Milestone contract state
  const [milestones, setMilestones] = useState([
    {
      id: 'm-1',
      name: 'Site Clearance & Excavation',
      contractAmount: 300000,
      claimedAmount: 300000,
      status: 'DISBURSED',
      completionProofCount: 8,
      inspectionPassed: true,
      paidDate: 'May 3, 2026',
    },
    {
      id: 'm-2',
      name: 'Concrete Foundation & Slab',
      contractAmount: 400000,
      claimedAmount: 400000,
      status: 'DISBURSED',
      completionProofCount: 12,
      inspectionPassed: true,
      paidDate: 'Jul 15, 2026',
    },
    {
      id: 'm-3',
      name: 'Structural Framing & Sheathing',
      contractAmount: 400000,
      claimedAmount: 400000,
      status: 'OWNER_APPROVED',
      completionProofCount: 18,
      inspectionPassed: true,
      paidDate: 'Included in Bank Draw #3',
    },
    {
      id: 'm-4',
      name: 'Rough Mechanical, Electrical & Plumbing (MEP)',
      contractAmount: 350000,
      claimedAmount: 0,
      status: 'READY_TO_CLAIM',
      completionProofCount: 4,
      inspectionPassed: true,
      paidDate: 'Pending Claim',
    },
    {
      id: 'm-5',
      name: 'Insulation, Drywall & Finishes',
      contractAmount: 550000,
      claimedAmount: 0,
      status: 'UPCOMING',
      completionProofCount: 0,
      inspectionPassed: false,
      paidDate: 'Upcoming',
    },
  ]);

  // Claims modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimMilestoneId, setClaimMilestoneId] = useState('m-4');
  const [claimAmount, setClaimAmount] = useState('350000');
  const [notes, setNotes] = useState('Rough MEP passed township inspection test. Green stickers posted.');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const totalContract = milestones.reduce((s, m) => s + m.contractAmount, 0);
  const totalPaid = milestones
    .filter(m => m.status === 'DISBURSED')
    .reduce((s, m) => s + m.contractAmount, 0);

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setMilestones(prev =>
      prev.map(m =>
        m.id === claimMilestoneId
          ? { ...m, status: 'CLAIM_SUBMITTED', claimedAmount: parseFloat(claimAmount) || m.contractAmount }
          : m
      )
    );
    setClaimSuccess(true);
    setTimeout(() => {
      setIsClaimModalOpen(false);
      setClaimSuccess(false);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">
              GC Contractor Portal · Fixed Lump-Sum Contract
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Milestone Payment Claims & Proof of Work</h1>
          <p className="text-xs text-slate-500">
            Contractor: Kunal Shah Development · Project: {activeProject.name}
          </p>
        </div>

        <button
          onClick={() => setIsClaimModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
        >
          <FileCheck className="w-4 h-4" />
          <span>+ Submit Milestone Payment Claim</span>
        </button>
      </div>

      {/* Contract Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Lump-Sum Contract</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ${totalContract.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Agreed Schedule of Values Milestones</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Payments Disbursed</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Site Work + Foundation Funded</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Remaining Contract Balance</span>
          <div className="text-2xl font-bold font-mono text-slate-800 mt-1">
            ${(totalContract - totalPaid).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">3 Milestones Remaining</p>
        </div>
      </div>

      {/* Milestone Claims Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Contract Milestones & Claim Status</span>
          <span className="text-slate-500 font-normal">Payment released upon verified completion proof</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-5 py-3 text-left">Milestone Description</th>
              <th className="px-5 py-3 text-right">Agreed Contract Price</th>
              <th className="px-5 py-3 text-center">Completion Proof</th>
              <th className="px-5 py-3 text-center">Township Inspection</th>
              <th className="px-5 py-3 text-right">Payment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {milestones.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-4 font-bold text-slate-900">{m.name}</td>
                <td className="px-5 py-4 text-right font-mono font-bold text-slate-900">
                  ${m.contractAmount.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 text-slate-700 font-medium">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>{m.completionProofCount} Photos</span>
                  </span>
                </td>
                <td className="px-5 py-4 text-center">
                  {m.inspectionPassed ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Passed
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Pending inspection</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                    m.status === 'DISBURSED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : m.status === 'OWNER_APPROVED'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : m.status === 'CLAIM_SUBMITTED'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.paidDate}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Milestone Claim Modal */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-900 text-base">Submit Milestone Payment Claim</h3>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-6 space-y-4 text-xs">
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
                  onClick={() => setIsClaimModalOpen(false)}
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
      )}
    </div>
  );
}

// GroundUp AI — GC (Fixed / Milestone Contract) Portal
// Dedicated portal for GCs under lump-sum contracts: milestone claims, completion proof, and change orders

import React, { useState, useEffect } from 'react';
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
  FileText,
  Layers,
  Send,
  Eye,
  DollarSign
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

  // Change Orders state synchronized from Owner / localStorage
  const [changeOrders, setChangeOrders] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
      if (stored) return JSON.parse(stored);
      const all = localStorage.getItem('groundup_all_change_orders');
      if (all) {
        const parsed = JSON.parse(all);
        const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
        if (filtered.length > 0) return filtered;
      }
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

  const [isGCCOModalOpen, setIsGCCOModalOpen] = useState(false);
  const [newGCCOCategory, setNewGCCOCategory] = useState('Other / Supplemental Trade Scope');
  const [newGCCOSubSection, setNewGCCOSubSection] = useState('');
  const [newGCCOAmount, setNewGCCOAmount] = useState('15000');
  const [newGCCOReason, setNewGCCOReason] = useState('Field Condition Revision');
  const [newGCCODesc, setNewGCCODesc] = useState('');
  const [gcCOSuccess, setGcCOSuccess] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(`groundup_change_orders_${selectedProjectId}`);
        if (stored) {
          setChangeOrders(JSON.parse(stored));
        } else {
          const all = localStorage.getItem('groundup_all_change_orders');
          if (all) {
            const parsed = JSON.parse(all);
            const filtered = parsed.filter((c: any) => c.projectId === selectedProjectId || !c.projectId);
            if (filtered.length > 0) setChangeOrders(filtered);
          }
        }
      } catch {}
    };

    window.addEventListener('groundup_co_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('groundup_co_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedProjectId]);

  const visibleCOs = changeOrders.filter(co => co.visible_to_gc !== false);
  const totalApprovedCOAmount = visibleCOs.reduce((sum, co) => sum + (Number(co.amount) || 0), 0);

  // Claims modal state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimMilestoneId, setClaimMilestoneId] = useState('m-4');
  const [claimAmount, setClaimAmount] = useState('350000');
  const [notes, setNotes] = useState('Rough MEP passed township inspection test. Green stickers posted.');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const totalContract = milestones.reduce((s, m) => s + m.contractAmount, 0);
  const adjustedContract = totalContract + totalApprovedCOAmount;
  const totalPaid = milestones
    .filter(m => m.status === 'DISBURSED')
    .reduce((s, m) => s + m.contractAmount, 0);
  const remainingContract = adjustedContract - totalPaid;

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

  const handleGCSubmitCO = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newGCCOAmount) || 0;
    if (amountVal <= 0) return;

    const newOrder = {
      id: `co-gc-${Date.now()}`,
      number: `CO-00${changeOrders.length + 1}`,
      category: newGCCOCategory.trim() || 'Supplemental Trade Scope',
      sub_section: newGCCOSubSection.trim() || 'Field Execution Phase',
      cost_code: '01-900',
      amount: amountVal,
      reason: newGCCOReason,
      description: newGCCODesc.trim() || 'Submitted by GC for owner approval.',
      status: 'APPROVED',
      visible_to_gc: true,
      gc_notes: 'Submitted directly by General Contractor. Authorized for work.',
      date: 'Today',
      is_other: true,
      projectId: selectedProjectId,
    };

    const next = [newOrder, ...changeOrders];
    setChangeOrders(next);
    try {
      localStorage.setItem(`groundup_change_orders_${selectedProjectId}`, JSON.stringify(next));
      const allCOs = JSON.parse(localStorage.getItem('groundup_all_change_orders') || '[]');
      localStorage.setItem('groundup_all_change_orders', JSON.stringify([newOrder, ...allCOs.filter((x: any) => x.id !== newOrder.id)]));
      window.dispatchEvent(new Event('groundup_co_updated'));
    } catch {}

    setGcCOSuccess(true);
    setTimeout(() => {
      setIsGCCOModalOpen(false);
      setGcCOSuccess(false);
      setNewGCCOSubSection('');
      setNewGCCODesc('');
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Base Lump-Sum Contract</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ${totalContract.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Agreed Schedule of Values</p>
        </div>
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-xs bg-indigo-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-indigo-950 font-semibold">Approved Change Orders</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
              {visibleCOs.length} Approved
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700 mt-1">
            +${totalApprovedCOAmount.toLocaleString()}
          </div>
          <p className="text-[11px] text-indigo-600 font-medium mt-1">Showed to GC & Authorized</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Adjusted Total Contract</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            ${adjustedContract.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Base Contract + Approved Orders</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Paid / Remaining</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            ${totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            ${remainingContract.toLocaleString()} balance remaining
          </p>
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

      {/* ══════════════════════════════════════════════════════════════════
          APPROVED CONTRACT CHANGE ORDERS & SUPPLEMENTAL ORDERS (SHOWED TO GC)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-bold text-slate-900 text-sm">
                Approved Contract Change Orders & Supplemental Orders (Showed to GC)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                {visibleCOs.length} Orders Live
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              These owner-approved change orders and supplemental trade scopes are formally broadcast to your contractor contract ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              +${totalApprovedCOAmount.toLocaleString()} Total Scope Added
            </span>
            <button
              onClick={() => setIsGCCOModalOpen(true)}
              className="px-3.5 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Request New Scope / Order</span>
            </button>
          </div>
        </div>

        {visibleCOs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No change orders currently assigned or showed to GC for this project.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3 text-left">Order #</th>
                  <th className="px-5 py-3 text-left">Scope Category & Sub-Section</th>
                  <th className="px-5 py-3 text-right">Approved Amount</th>
                  <th className="px-5 py-3 text-left">Justification & Scope Notes</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-left">Owner Authorization Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleCOs.map((co) => (
                  <tr key={co.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{co.number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{co.category}</span>
                        {co.is_other && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Other Scope
                          </span>
                        )}
                      </div>
                      {co.sub_section && (
                        <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                          Sub-Section: {co.sub_section}
                        </div>
                      )}
                      {co.cost_code && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          Cost Code: {co.cost_code}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-emerald-700 text-sm">
                      +${(Number(co.amount) || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs">
                      <div className="font-semibold text-slate-800">{co.reason?.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{co.description}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Showed to GC · Authorized</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{co.date}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-700 max-w-xs">
                      <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-[11px] text-indigo-950 font-medium">
                        {co.gc_notes || 'Owner approved. GC authorized to proceed with execution.'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

      {/* GC Change Order Request Modal */}
      {isGCCOModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-900 text-base">Request Change Order / Extra Scope</h3>
              </div>
              <button
                onClick={() => setIsGCCOModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGCSubmitCO} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scope Category Name</label>
                <input
                  type="text"
                  value={newGCCOCategory}
                  onChange={(e) => setNewGCCOCategory(e.target.value)}
                  placeholder="e.g. Foundation Additional Tieback Piles"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sub-Section / Trade Phase</label>
                <input
                  type="text"
                  value={newGCCOSubSection}
                  onChange={(e) => setNewGCCOSubSection(e.target.value)}
                  placeholder="e.g. Sub-Section: Helical Soil Piles Phase 1B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Cost / Amount ($)</label>
                <input
                  type="number"
                  value={newGCCOAmount}
                  onChange={(e) => setNewGCCOAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Root Cause / Justification</label>
                <input
                  type="text"
                  value={newGCCOReason}
                  onChange={(e) => setNewGCCOReason(e.target.value)}
                  placeholder="e.g. Subsurface rocky strata requiring pneumatic jackhammering"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Description & Scope Notes</label>
                <textarea
                  rows={3}
                  value={newGCCODesc}
                  onChange={(e) => setNewGCCODesc(e.target.value)}
                  placeholder="Describe trade mobilization, materials, and inspector requirements..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGCCOModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {gcCOSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Order Submitted & Authorized!</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Submit Change Order</span>
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

// GroundUp AI — Construction Lender Portal (BCB Community Bank)
// Purpose-built for loan officers to review draw packages, audit lien waivers, approve/reject lines, and record wire disbursements

import React, { useState } from 'react';
import { 
  Landmark, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Send,
  Building,
  ChevronDown,
  ArrowRight,
  FileText,
  Calendar,
  Check
} from 'lucide-react';
import { Project, RejectionReasonCode } from '../../shared/types';

interface LenderPortalScreenProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  onDisburseFunds?: (drawId: string, amount: number) => void;
}

export function LenderPortalScreen({
  projects,
  selectedProjectId,
  onSelectProject,
  onDisburseFunds,
}: LenderPortalScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Draw queue state
  const [selectedDrawId, setSelectedDrawId] = useState('draw-3');
  const [drawStatus, setDrawStatus] = useState<'pending' | 'approved' | 'disbursed'>('pending');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [wireRef, setWireRef] = useState(`WIRE-BCB-${Math.floor(Math.random() * 800000 + 100000)}`);
  const [disburseSuccess, setDisburseSuccess] = useState(false);

  // Line items state with interactive approvals
  const [drawLines, setDrawLines] = useState([
    {
      id: 'l-1',
      category: 'Rough Electrical',
      requested: 68400,
      approved: 68400,
      status: 'APPROVED' as 'APPROVED' | 'PARTIAL' | 'REJECTED',
      rejectionReason: null as RejectionReasonCode | null,
      lienWaiverPresent: true,
      inspectionPassed: true,
      spendDocumented: 68400,
    },
    {
      id: 'l-2',
      category: 'HVAC (Partial Milestone)',
      requested: 12000,
      approved: 12000,
      status: 'APPROVED' as 'APPROVED' | 'PARTIAL' | 'REJECTED',
      rejectionReason: null as RejectionReasonCode | null,
      lienWaiverPresent: true,
      inspectionPassed: true,
      spendDocumented: 12000,
    },
    {
      id: 'l-3',
      category: 'Windows & Doors',
      requested: 58000,
      approved: 58000,
      status: 'APPROVED' as 'APPROVED' | 'PARTIAL' | 'REJECTED',
      rejectionReason: null as RejectionReasonCode | null,
      lienWaiverPresent: true,
      inspectionPassed: true,
      spendDocumented: 58000,
    },
    {
      id: 'l-4',
      category: 'Exterior Roofing & Waterproofing',
      requested: 46600,
      approved: 0,
      status: 'REJECTED' as 'APPROVED' | 'PARTIAL' | 'REJECTED',
      rejectionReason: 'MISSING_LIEN_WAIVER' as RejectionReasonCode | null,
      lienWaiverPresent: false,
      inspectionPassed: true,
      spendDocumented: 46600,
    },
  ]);

  const totalRequested = drawLines.reduce((s, l) => s + l.requested, 0);
  const totalApproved = drawLines
    .filter(l => l.status === 'APPROVED' || l.status === 'PARTIAL')
    .reduce((s, l) => s + (l.approved || 0), 0);
  const retainageHoldback = Math.round(totalApproved * 0.10); // 10% holdback
  const netWireDisbursement = totalApproved - retainageHoldback;

  const handleUpdateLineStatus = (lineId: string, status: 'APPROVED' | 'PARTIAL' | 'REJECTED', reason?: RejectionReasonCode) => {
    setDrawLines(prev =>
      prev.map(l => {
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
    setDisburseSuccess(true);
    if (onDisburseFunds) {
      onDisburseFunds(selectedDrawId, netWireDisbursement);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Lender Portal · BCB Community Bank
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Construction Loan Draw Review Queue</h1>
          <p className="text-xs text-slate-500">
            Audit contractor lien waivers, verify inspection sign-offs, and authorize wire disbursements
          </p>
        </div>

        {/* Project Selector for Lender */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600">Active Loan:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none shadow-xs"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.address})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loan Facility Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Facility Commitment</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">$1,200,000</div>
          <span className="text-[10px] text-slate-500">BCB Loan #BCB-2025-982</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Funded to Date</span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">$909,000</div>
          <span className="text-[10px] text-purple-600">Disbursed via Draw #1 & #2</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Interest Reserve Balance</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">$32,500</div>
          <span className="text-[10px] text-emerald-600">Auto-drawn monthly interest</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Pending Draw Request</span>
          <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">${totalRequested.toLocaleString()}</div>
          <span className="text-[10px] text-amber-700 font-semibold">Draw #3 (4 line items)</span>
        </div>
      </div>

      {/* Main Draw Review Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900 text-white font-mono">
                Draw #3
              </span>
              <h3 className="font-bold text-slate-900 text-base">AIA G702 / G703 Application for Payment</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Borrower: GroundUp Partners LLC · Project: {activeProject.name} · Submitted: Oct 1, 2026
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              drawStatus === 'disbursed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {drawStatus === 'disbursed' ? '✓ Funds Disbursed' : '⏳ Pending Review'}
            </span>
          </div>
        </div>

        {/* Line Items Table with Action Buttons */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Schedule of Values Category Breakdown</span>
            <span className="text-slate-500 font-normal">Audit each line item below</span>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Requested</th>
                <th className="px-4 py-3 text-center">Lien Waiver</th>
                <th className="px-4 py-3 text-center">Inspection</th>
                <th className="px-4 py-3 text-right">Approved Amount</th>
                <th className="px-4 py-3 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drawLines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{line.category}</div>
                    {line.rejectionReason && (
                      <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                        ⚠️ Reason: {line.rejectionReason.replace(/_/g, ' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ${line.requested.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {line.lienWaiverPresent ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        Missing Waiver
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Passed
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ${line.approved.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleUpdateLineStatus(line.id, 'APPROVED')}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                          line.status === 'APPROVED'
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateLineStatus(line.id, 'REJECTED', 'MISSING_LIEN_WAIVER')}
                        className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                          line.status === 'REJECTED'
                            ? 'bg-red-700 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation & Wire Authorization Panel */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-slate-400">Total Requested by Borrower</span>
            <span className="text-base font-bold">${totalRequested.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Total Approved Line Items</span>
            <span className="text-base font-bold text-white">${totalApproved.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-amber-400">
            <span>Less: 10% Construction Retainage (Held in Escrow)</span>
            <span>- ${retainageHoldback.toLocaleString()}</span>
          </div>
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-lg font-bold text-emerald-400">
            <span>Net Authorized Wire Disbursement</span>
            <span>${netWireDisbursement.toLocaleString()}</span>
          </div>
        </div>

        {/* Wire Execution Form */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 text-xs">
          <h4 className="font-bold text-slate-900 text-sm">Disbursement Authorization & Wire Release</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Fedwire Reference Number</label>
              <input
                type="text"
                value={wireRef}
                onChange={(e) => setWireRef(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-semibold">Borrower Operating Account</label>
              <input
                type="text"
                defaultValue="BCB Checking Ending ···4891"
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Executing wire releases funds and updates the project's Funding Truth ledger in real-time.
            </span>
            <button
              onClick={handleConfirmDisbursement}
              disabled={drawStatus === 'disbursed' || totalApproved <= 0}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition shadow-xs disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              {drawStatus === 'disbursed' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Wire Confirmed & Disbursed</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Execute Wire Disbursement (${netWireDisbursement.toLocaleString()})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

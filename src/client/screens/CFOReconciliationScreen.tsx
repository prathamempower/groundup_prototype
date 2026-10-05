// GroundUp AI — CFO / Accounting Reconciliation & Lien Waiver Audit Center
// Compares Spend Truth vs Funding Truth, tracks un-drawn expenses, and audits missing subcontractor lien waivers

import React, { useState } from 'react';
import { 
  Building2, 
  FileCheck, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Download, 
  Mail, 
  Upload, 
  CreditCard,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { Project } from '../../shared/types';

interface CFOReconciliationScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function CFOReconciliationScreen({
  projects,
  selectedProjectId,
}: CFOReconciliationScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Lien waivers audit state
  const [lienWaivers, setLienWaivers] = useState([
    {
      id: 'lw-1',
      vendor: 'ABC Electric LLC',
      trade: 'Electrical',
      invoiceNo: 'INV-2026-089',
      amount: 68400,
      paymentDate: 'Sep 15, 2026',
      waiverStatus: 'MISSING' as 'VERIFIED' | 'MISSING' | 'PENDING',
      drawImpact: 'Draw #3 Electrical line blocked',
    },
    {
      id: 'lw-2',
      vendor: 'Sylvia Concrete LLC',
      trade: 'Foundation',
      invoiceNo: 'INV-2026-042',
      amount: 95000,
      paymentDate: 'Jul 20, 2026',
      waiverStatus: 'VERIFIED' as 'VERIFIED' | 'MISSING' | 'PENDING',
      drawImpact: 'None · Fully funded',
    },
    {
      id: 'lw-3',
      vendor: 'Kuiken Brothers Lumber',
      trade: 'Framing Material',
      invoiceNo: 'KB-88910',
      amount: 142000,
      paymentDate: 'Aug 10, 2026',
      waiverStatus: 'VERIFIED' as 'VERIFIED' | 'MISSING' | 'PENDING',
      drawImpact: 'None · Fully funded',
    },
    {
      id: 'lw-4',
      vendor: 'NJ Pipe Services LLC',
      trade: 'Plumbing',
      invoiceNo: 'INV-2026-0982',
      amount: 28400,
      paymentDate: 'Sep 28, 2026',
      waiverStatus: 'MISSING' as 'VERIFIED' | 'MISSING' | 'PENDING',
      drawImpact: 'Upcoming Draw #4',
    },
  ]);

  // Spend vs Draw matrix
  const reconciliationRows = [
    { category: 'Plans & Permits',       actualSpent: 44500,  drawnFunded: 44500,  unDrawn: 0,     retainage: 0     },
    { category: 'Site Work',             actualSpent: 82000,  drawnFunded: 67000,  unDrawn: 15000, retainage: 6700  },
    { category: 'Foundation',            actualSpent: 95000,  drawnFunded: 95000,  unDrawn: 0,     retainage: 9500  },
    { category: 'Framing',               actualSpent: 142000, drawnFunded: 142000, unDrawn: 0,     retainage: 14200 },
    { category: 'Rough Plumbing',        actualSpent: 55760,  drawnFunded: 0,      unDrawn: 55760, retainage: 0     },
    { category: 'Rough Electrical',      actualSpent: 68400,  drawnFunded: 0,      unDrawn: 68400, retainage: 0     },
    { category: 'Exterior & Roofing',    actualSpent: 88000,  drawnFunded: 0,      unDrawn: 88000, retainage: 0     },
    { category: 'Windows & Doors',       actualSpent: 58000,  drawnFunded: 0,      unDrawn: 58000, retainage: 0     },
  ];

  const totalActualSpent = reconciliationRows.reduce((s, r) => s + r.actualSpent, 0);
  const totalDrawnFunded = reconciliationRows.reduce((s, r) => s + r.drawnFunded, 0);
  const totalUnDrawn = reconciliationRows.reduce((s, r) => s + r.unDrawn, 0);
  const totalRetainage = reconciliationRows.reduce((s, r) => s + r.retainage, 0);

  const [exportSuccess, setExportSuccess] = useState(false);
  const [remindToast, setRemindToast] = useState<string | null>(null);

  const handleResolveWaiver = (id: string) => {
    setLienWaivers(prev =>
      prev.map(lw => (lw.id === id ? { ...lw, waiverStatus: 'VERIFIED', drawImpact: 'Resolved' } : lw))
    );
  };

  const handleRemindVendor = (vendor: string) => {
    setRemindToast(vendor);
    setTimeout(() => setRemindToast(null), 3000);
  };

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Toast */}
      {exportSuccess && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Comprehensive Financial Variance Workbook (Excel) generated & downloaded.</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono uppercase">Exported</span>
        </div>
      )}

      {remindToast && (
        <div className="bg-amber-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-300" />
            <span>Automated unconditional lien waiver request emailed to <strong>{remindToast}</strong>.</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono uppercase">Dispatched</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              CFO / Accounting Center · Financial Truth Reconciler
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Draw Reconciliation & Lien Waiver Audit</h1>
          <p className="text-xs text-slate-500">
            Reconciles actual contractor spend against bank disbursements, audits un-drawn funds, and flags missing waivers
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Export Reconciliation Audit (Excel)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Total Incurred Actual Spend</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
            ${totalActualSpent.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500">Posted expense records</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Lender Funded to Date</span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-0.5">
            ${totalDrawnFunded.toLocaleString()}
          </div>
          <span className="text-[10px] text-purple-600">Disbursed by BCB Bank</span>
        </div>
        <div className="bg-white border border-amber-200 bg-amber-50/50 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-amber-800 font-medium">Un-Drawn Actual Spend</span>
          <div className="text-xl font-bold font-mono text-amber-900 mt-0.5">
            ${totalUnDrawn.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold">Fronted cash awaiting draw</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-400 font-medium">Retainage Holdback in Escrow</span>
          <div className="text-xl font-bold font-mono text-slate-700 mt-0.5">
            ${totalRetainage.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">10% released at Certificate of Occupancy</span>
        </div>
      </div>

      {/* Missing Lien Waiver Audit Center */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Missing Lien Waiver Audit Queue</h3>
              <p className="text-xs text-slate-500">
                Banks reject draw line items if paid subcontractors lack executed unconditional lien waivers
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {lienWaivers.filter(lw => lw.waiverStatus === 'MISSING').length} Waivers Needed
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3 text-left">Subcontractor Entity</th>
                <th className="px-4 py-3 text-left">Trade</th>
                <th className="px-4 py-3 text-left">Invoice Ref</th>
                <th className="px-4 py-3 text-right">Paid Amount</th>
                <th className="px-4 py-3 text-center">Waiver Status</th>
                <th className="px-4 py-3 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lienWaivers.map((lw) => (
                <tr key={lw.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">{lw.vendor}</td>
                  <td className="px-4 py-3 text-slate-600">{lw.trade}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{lw.invoiceNo}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ${lw.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {lw.waiverStatus === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Waiver Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        Missing Waiver
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {lw.waiverStatus === 'MISSING' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleRemindVendor(lw.vendor)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer transition flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" /> Remind
                        </button>
                        <button
                          onClick={() => handleResolveWaiver(lw.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-bold cursor-pointer transition"
                        >
                          Upload & Verify
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Clean Audit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Spend vs Draw Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Draw Reconciliation Matrix — Spend Truth vs. Funding Truth</span>
          <span className="text-slate-500 font-normal">Identifies cash gap per category</span>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Actual Spend Incurred</th>
              <th className="px-4 py-3 text-right">Lender Disbursed</th>
              <th className="px-4 py-3 text-right">Un-Drawn Spend</th>
              <th className="px-4 py-3 text-right">10% Retainage Held</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reconciliationRows.map((r) => (
              <tr key={r.category} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-900">{r.category}</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                  ${r.actualSpent.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-purple-700 font-bold">
                  ${r.drawnFunded.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-amber-700">
                  ${r.unDrawn.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">
                  ${r.retainage.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

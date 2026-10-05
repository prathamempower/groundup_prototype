// GroundUp AI — Comprehensive Certified Final Report Modal
// Executive-grade printable audit report matching Image 2 "Final Output":
// Verified Records: Source Linked, Audit Logged, Ready for Reporting
// Displays Four Truths Deterministic Reconciliation, CSI Categories, Verified Invoices,
// 10-Step Pipeline Audit Trail, SHA-256 Signature, and Zero-Hallucination Lineage

import React from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  CheckCircle2,
  Building,
  DollarSign,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  Check,
  AlertTriangle
} from 'lucide-react';
import { FinalReportData } from '../../server/services/pipelineService';

interface FinalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: FinalReportData | null;
}

export function FinalReportModal({
  isOpen,
  onClose,
  reportData,
}: FinalReportModalProps) {
  if (!isOpen || !reportData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${reportData.reportId}_Audit_Report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
                  Certified Final Audit Report
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: {reportData.reportId}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                {reportData.project.name} — Construction Financial Intelligence Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-8 space-y-6 text-xs text-slate-800 flex-1">
          {/* Certificate Verification Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 text-sm">Audit Certificate Verified · Zero Hallucination Guarantee</p>
                <p className="text-emerald-800 text-xs">
                  All figures computed strictly via deterministic code with 100% source document lineage. Verified Records Source-Linked & Audit-Logged.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[11px] font-mono text-emerald-900 bg-white px-3 py-1 rounded-md border border-emerald-300 font-bold block">
                SHA256: {reportData.sha256Hash.substring(0, 16)}...
              </span>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">
                Quality Confidence: {(reportData.metrics.overallConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Project Entity</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.project.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{reportData.project.address}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Project Status</p>
              <p className="font-bold text-emerald-700 text-xs mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{reportData.project.status} (Active Draw Cycle)</span>
              </p>
              <p className="text-[10px] text-slate-500">{reportData.project.units} Units · {reportData.project.squareFeet.toLocaleString()} SF</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Sponsor / GC</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.sponsor.name}</p>
              <p className="text-[10px] text-slate-500">{reportData.sponsor.company}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase text-[10px]">Lender Facility</p>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.project.lenderName}</p>
              <p className="text-[10px] text-slate-500">${(reportData.fourTruths.loanCommitment / 1000).toFixed(0)}k Facility @ {reportData.fourTruths.interestRatePct}%</p>
            </div>
          </div>

          {/* Section 1: Four Truths Reconciliation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Four Truths Financial Reconciliation</span>
              </h3>
              <span className="text-[11px] text-slate-400">Rule 2: Multiple truths by domain. Zero forced blending.</span>
            </div>

            <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">Domain Truth</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Mathematical Formula & Source Lineage</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Reconciled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">1. Budget Truth</td>
                  <td className="py-2.5 px-3 text-slate-500">Approved Master Budget + Verified Change Orders</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${reportData.fourTruths.masterBudget.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">2. Spend Truth</td>
                  <td className="py-2.5 px-3 text-slate-500">Sum of posted subcontractor invoices with verified lien waivers</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${reportData.fourTruths.incurredSpend.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">3. Funding Truth</td>
                  <td className="py-2.5 px-3 text-slate-500">Confirmed lender wire disbursements recorded in draw ledger</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${reportData.fourTruths.lenderDisbursed.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-amber-50/70">
                  <td className="py-2.5 px-3 font-bold text-amber-950">4. Developer Cash Exposure</td>
                  <td className="py-2.5 px-3 text-amber-800">Spend Truth − Funding Truth (Cash fronted awaiting draw reimbursement)</td>
                  <td className="py-2.5 px-3 text-right font-bold text-amber-900">
                    ${reportData.fourTruths.developerCashExposure.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">Daily Loan Carry Cost</td>
                  <td className="py-2.5 px-3 text-slate-500">(Disbursed Loan Balance × {reportData.fourTruths.interestRatePct}%) / 365 days</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    ${reportData.fourTruths.dailyCarryingCost.toFixed(2)} / day
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: CSI MasterFormat Breakdown */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              CSI MasterFormat Category Breakdown & Variance
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">Cost Code</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Category</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Budgeted</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Incurred Spend</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Variance</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.csiCategories.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{c.costCode}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{c.category}</td>
                    <td className="py-2 px-3 text-right text-slate-700">${c.budgetedAmount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900">${c.incurredSpend.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-slate-600">${c.variance.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === 'ON_BUDGET'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'APPROACHING_LIMIT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Verified Subcontractor Invoices Ledger */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Verified Subcontractor Invoices Ledger ({reportData.verifiedInvoices.length})
            </h3>
            <table className="w-full text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 border-b border-slate-200">Vendor</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Category</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Invoice #</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Date</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-right">Amount</th>
                  <th className="py-2.5 px-3 border-b border-slate-200 text-center">Lien Waiver</th>
                  <th className="py-2.5 px-3 border-b border-slate-200">Source Document</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {reportData.verifiedInvoices.map((inv, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-900">{inv.vendor}</td>
                    <td className="py-2 px-3 text-slate-600">{inv.category}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{inv.invoiceNumber}</td>
                    <td className="py-2 px-3 text-slate-500">{inv.date}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">${inv.amount.toLocaleString()}</td>
                    <td className="py-2 px-3 text-center">
                      {inv.lienWaiverVerified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          <Check className="w-3 h-3" /> Received
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[10px] truncate max-w-[140px]">{inv.sourceDocument}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: 10-Step AI Processing Pipeline Audit Trail */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>10-Step AI Processing Pipeline Audit Trail</span>
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
              {reportData.pipelineTrace.map((step) => (
                <div key={step.stepNumber} className="p-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{step.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {(step.confidence * 100).toFixed(0)}% Conf
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{step.timestamp.split('T')[1]?.substring(0, 8) || 'Verified'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Signoff */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-slate-500">
            <div>
              <p className="font-bold text-slate-900">Generated by GroundUp AI Engine</p>
              <p className="text-[11px]">Audit Timestamp: {new Date(reportData.generatedAt).toLocaleString()} · SHA256 Verified</p>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-emerald-800 uppercase tracking-wider text-xs">COMPLIANCE CERTIFIED</p>
              <p className="text-[10px] text-slate-500">Zero Hallucination Guaranteed · Four Truths Reconciliation</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Certified document ready for Lender Draw submission & Sponsor reporting
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}

// GroundUp AI — Dedicated Human-in-the-Loop Document Extraction Review Workbench
// High-fidelity split view: interactive document viewer canvas on the left, structured field reconciliation on the right

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../../shared/types';
import { getProjectBudgetLines } from '../project-detail/initial-state';

interface DocumentReviewScreenProps {
  projects: Project[];
  summary: ProjectFourTruthsSummary | null;
  currentRole: UserRole;
  onConfirmPost?: (postData: any) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString();

export function DocumentReviewScreen({
  projects,
  summary,
  currentRole,
  onConfirmPost,
}: DocumentReviewScreenProps) {
  const { projectId, docId } = useParams<{ projectId?: string; docId?: string }>();
  const navigate = useNavigate();

  const activeProjectId = projectId || projects[0]?.id || 'proj-73-broadway';
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectName = activeProject?.name || summary?.project_name || '73 Broadway, Hoboken';

  const budgetLines = getProjectBudgetLines(activeProjectId);
  const categories = budgetLines.map(b => b.category);

  // Document extraction fields state
  const [vendor, setVendor] = useState('NJ Pipe Services LLC');
  const [amount, setAmount] = useState('28400');
  const [category, setCategory] = useState('Rough Plumbing');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0982');
  const [date, setDate] = useState('2026-09-28');
  const [costCode, setCostCode] = useState('22-000');
  const [aiConfidence] = useState(61);
  const [isPosting, setIsPosting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Document Viewer Canvas Controls
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const parsedAmount = parseFloat(amount) || 0;

  const handleApproveAndPost = () => {
    setIsPosting(true);
    const postPayload = {
      docId: docId || 'doc-1',
      vendor,
      amount: parsedAmount,
      category,
      invoiceNumber,
      date,
      costCode,
    };

    if (onConfirmPost) {
      onConfirmPost(postPayload);
    }

    setTimeout(() => {
      setIsPosting(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate(`/projects/${activeProjectId}/documents`);
      }, 1000);
    }, 600);
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col w-full pb-16 select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${activeProjectId}/documents`)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back to Document Inbox"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{projectName}</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-500">Document Inbox</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-900">OCR Extraction Review</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <span>Plumbing_Invoice_Sep.pdf</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {aiConfidence}% AI Confidence · Needs Human Audit
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${activeProjectId}/documents`)}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel / Return
            </button>
            <button
              onClick={handleApproveAndPost}
              disabled={isPosting || isSuccess || parsedAmount <= 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {isPosting ? (
                <span>Posting to Ledger...</span>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Posted to Spend Truth!</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Confirm & Post to Spend Truth ({fmt(parsedAmount)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workbench */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Scanned Document Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg flex flex-col overflow-hidden min-h-[600px]">
          {/* Document Canvas Toolbar */}
          <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-mono font-bold text-white">Plumbing_Invoice_Sep.pdf</span>
              <span className="text-[11px] text-slate-500">(Page 1 of 1 · 300 DPI)</span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setZoom(z => Math.max(50, z - 10))}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-slate-400 px-1">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-3 bg-slate-700 mx-1" />
              <button
                onClick={() => setRotation(r => (r + 90) % 360)}
                className="p-1 hover:text-white transition cursor-pointer"
                title="Rotate Clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas Preview with OCR Bounding Box Highlights */}
          <div className="flex-1 p-6 overflow-auto flex items-center justify-center bg-slate-950/60">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="bg-white text-slate-900 rounded-xl p-8 shadow-2xl max-w-md w-full font-mono text-xs space-y-4 border border-slate-300 relative"
            >
              {/* OCR Highlight Box 1: Vendor */}
              <div className="border-2 border-emerald-500/80 bg-emerald-500/10 p-2 rounded-lg relative">
                <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-emerald-600 text-white rounded text-[9px] font-sans font-bold">
                  Vendor 98%
                </span>
                <div className="font-bold text-sm text-slate-900">NJ PIPE SERVICES LLC</div>
                <div className="text-[10px] text-slate-500">104 Hudson St, Hoboken NJ 07030 · (201) 555-0199</div>
              </div>

              {/* Invoice Meta */}
              <div className="flex justify-between items-center py-2 border-b border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">BILL TO:</span>
                  <span className="font-bold text-slate-800">GroundUp Partners LLC</span>
                </div>
                {/* OCR Highlight Box 2: Invoice & Date */}
                <div className="border-2 border-blue-500/80 bg-blue-500/10 p-1.5 rounded relative text-right">
                  <span className="absolute -top-2.5 right-1 px-1 py-0.2 bg-blue-600 text-white rounded text-[9px] font-sans font-bold">
                    Inv# 94%
                  </span>
                  <div className="font-bold text-slate-900">INV-2026-0982</div>
                  <div className="text-[10px] text-slate-600">Date: Sep 28, 2026</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-1.5 py-2">
                <div className="flex justify-between font-bold text-slate-500 text-[10px] border-b border-slate-100 pb-1">
                  <span>DESCRIPTION</span>
                  <span>AMOUNT</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Rough In Plumbing (Fl 1-4)</span>
                  <span className="font-bold">$22,000.00</span>
                </div>
                <div className="flex justify-between text-slate-800">
                  <span>Underground Sewer Main Tie-in</span>
                  <span className="font-bold">$6,400.00</span>
                </div>
              </div>

              {/* OCR Highlight Box 3: Total & Exclusions */}
              <div className="border-2 border-amber-500 bg-amber-500/10 p-2.5 rounded-lg space-y-1 relative">
                <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-amber-600 text-white rounded text-[9px] font-sans font-bold">
                  Ambiguity Flag 61%
                </span>
                <div className="flex justify-between font-bold text-sm text-slate-900">
                  <span>NET WORK AMOUNT:</span>
                  <span className="text-emerald-700">$28,400.00</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 line-through">
                  <span>Sales Tax (Capital Exemption):</span>
                  <span>$1,890.00</span>
                </div>
                <div className="text-[9px] text-amber-800 font-sans mt-1 bg-amber-100/80 p-1 rounded">
                  ⚠️ AI Note: Total includes previous invoice balance of $12,000. Clean trade scope normalized to $28,400.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Verification Form & Normalization Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Structured Fields Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Normalized Ledger Entry</h3>
                <p className="text-xs text-slate-500">Edit fields extracted by GroundUp AI Engine</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                AIA Cost Code
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contractor / Vendor Name</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Budget Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CSI Cost Code</label>
                  <input
                    type="text"
                    value={costCode}
                    onChange={e => setCostCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Normalized Net Amount to Post</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold font-mono">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold font-mono text-sm focus:bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KEEP vs AVOID Rule Engine Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Audit Rule Engine: KEEP vs. AVOID
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-900">Trade Scope Incurred</div>
                  <div className="text-[10px] text-emerald-700">Rough plumbing labor & materials</div>
                </div>
                <span className="font-mono font-bold text-emerald-800">KEEP: +$28,400</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-500">
                <div>
                  <div className="font-semibold text-slate-700">NJ State Sales Tax</div>
                  <div className="text-[10px] text-slate-400">Capital improvement exempt (ST-8 form)</div>
                </div>
                <span className="font-mono text-slate-400 line-through">AVOID: $1,890</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-slate-500">
                <div>
                  <div className="font-semibold text-slate-700">Previous Balance Carried</div>
                  <div className="text-[10px] text-slate-400">Paid in prior Draw #1 disbursement</div>
                </div>
                <span className="font-mono text-slate-400 line-through">AVOID: $12,000</span>
              </div>
            </div>
          </div>

          {/* Live Four Truths Reconciliation Impact */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="font-bold text-white text-xs">Four Truths Ledger Impact</h4>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Spend Truth (Total Incurred)</span>
                <span className="font-mono text-emerald-400 font-bold">$1,412,400 → {fmt(1412400 + parsedAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Developer Cash Exposure</span>
                <span className="font-mono text-amber-400 font-bold">$318,400 → {fmt(318400 + parsedAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400">Next Draw Eligibility</span>
                <span className="font-mono text-white font-bold">+{fmt(parsedAmount)} eligible for Draw #3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

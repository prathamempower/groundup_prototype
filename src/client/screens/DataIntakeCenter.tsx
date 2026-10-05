// GroundUp AI — Data Intake Center
// Multi-role ingestion hub for Budget/SOV, Invoices, Schedule, and Loan Facility Terms

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Receipt,
  Calendar,
  Landmark,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UploadCloud,
  FileText,
  X
} from 'lucide-react';
import { UserRole } from '../../shared/types';
import { MultiDocExtractionReview } from '../components/MultiDocExtractionReview';

interface DataIntakeCenterProps {
  projectId: string;
  activeRole: UserRole;
  onIntakeSuccess: () => void;
  onClose: () => void;
}

export const DataIntakeCenter: React.FC<DataIntakeCenterProps> = ({
  projectId,
  activeRole,
  onIntakeSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'budget' | 'invoice' | 'schedule' | 'loan'>('budget');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [batchReviewData, setBatchReviewData] = useState<any>(null);

  // 1. Budget / SOV State
  const [sovLines, setSovLines] = useState([
    { category: 'Demolition & Site Prep', sub_category: 'Site clearing', cost_code: '02-100', amount: 350000 },
    { category: 'Concrete & Foundation', sub_category: 'Post-tension slab', cost_code: '03-300', amount: 1450000 },
    { category: 'Framing & Lumber', sub_category: '4-story wood frame', cost_code: '06-100', amount: 2800000 },
    { category: 'Plumbing', sub_category: 'Rough-in & drain stacks', cost_code: '22-100', amount: 950000 },
    { category: 'Electrical', sub_category: 'Panels & transformers', cost_code: '26-100', amount: 1100000 },
  ]);

  // 2. Invoice / Expense State
  const [invoiceCategory, setInvoiceCategory] = useState('Plumbing');
  const [vendorName, setVendorName] = useState('Apex Commercial Plumbing');
  const [invoiceAmount, setInvoiceAmount] = useState('45000');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDesc, setInvoiceDesc] = useState('Copper fittings and water pressure manifold testing');
  const [lienWaiver, setLienWaiver] = useState(true);

  // 3. Schedule State
  const [milestones, setMilestones] = useState([
    { milestone: 'Site Grading & Undergrounds', trade: 'Demolition & Site Prep', planned_start: '2026-01-10', planned_end: '2026-01-25', verified_progress_pct: 1.0 },
    { milestone: 'Foundation & Podium Slab', trade: 'Concrete & Foundation', planned_start: '2026-01-26', planned_end: '2026-03-05', verified_progress_pct: 1.0 },
    { milestone: 'Structural Framing', trade: 'Framing & Lumber', planned_start: '2026-02-15', planned_end: '2026-04-15', verified_progress_pct: 0.50 },
    { milestone: 'Plumbing Rough-In & Stacks', trade: 'Plumbing', planned_start: '2026-02-01', planned_end: '2026-03-10', verified_progress_pct: 0.55 },
  ]);

  // Handlers
  const handleSaveBudget = async () => {
    setLoading(true);
    try {
      await fetch('/api/intake/sov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, lines: sovLines, actorRole: activeRole }),
      });
      setSuccessMsg('Master Budget & Schedule of Values (SOV) saved successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/intake/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          actorRole: activeRole,
          expenseData: {
            category: invoiceCategory,
            vendor_name: vendorName,
            amount: parseFloat(invoiceAmount),
            expense_date: invoiceDate,
            description: invoiceDesc,
            lien_waiver_received: lienWaiver,
          },
        }),
      });
      setSuccessMsg('Invoice recorded to Spend Truth successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      await fetch('/api/intake/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, activities: milestones, actorRole: activeRole }),
      });
      setSuccessMsg('Schedule milestones and physical progress % updated successfully.');
      setLoading(false);
      onIntakeSuccess();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const addSovRow = () => {
    setSovLines([...sovLines, { category: '', sub_category: '', cost_code: '', amount: 0 }]);
  };

  const removeSovRow = (index: number) => {
    setSovLines(sovLines.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                GroundUp Intake Hub
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Project Data Intake & Ingestion Center
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-surface-950 px-5 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'budget'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> 1. Budget & SOV (CFO)
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'invoice'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" /> 2. Invoices & Expenses (Accountant)
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              activeTab === 'schedule'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" /> 3. Schedule & Inspections (PM)
          </button>
          <button
            onClick={() => setActiveTab('ai_parse' as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
              (activeTab as string) === 'ai_parse'
                ? 'bg-brand-500 text-slate-950 font-bold shadow-md shadow-brand-500/20'
                : 'text-brand-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 4. AI Document Extraction (KEEP vs AVOID Rules)
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 4. AI Parsing & Extraction Rules Tab */}
          {(activeTab as string) === 'ai_parse' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> GroundUp AI Extraction & Verification Engine
                </h3>
                <p className="text-xs text-slate-400">
                  Parses construction documents and enforces strict <strong>KEEP vs AVOID</strong> rules to prevent double counting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Upload Action Card */}
                <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Simulate Document Extraction</h4>
                  <div className="space-y-2">
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch('/api/documents/parse', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              fileName: 'Invoice_Titan_Concrete_INV1092.pdf',
                              content: `Titan Concrete LLC\nInvoice #INV-1092\n03-300 Cast-in-Place Concrete Slab: $133,200.00\nSubtotal: $133,200.00\nPrevious Statement Balance: $45,000.00\nTotal Amount Due: $178,200.00`,
                              projectId,
                            }),
                          });
                          const data = await res.json();
                          const result = data.result || data;
                          setSuccessMsg(`Extracted ${result.lineItems?.length || 0} valid numbers ($${(result.totalAmount || 0).toLocaleString()}) and excluded ${result.excludedFigures?.length || 0} double-count entries.`);
                          setLoading(false);
                          onIntakeSuccess();
                        } catch (e: any) {
                          console.error(e);
                          setLoading(false);
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-surface-900 border border-slate-700 hover:border-emerald-500/50 text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">Parse Subcontractor Invoice</p>
                        <p className="text-[11px] text-slate-400">Keeps Net Amount Due · Filters Previous Balance ($45k)</p>
                      </div>
                      <Upload className="w-4 h-4 text-emerald-400" />
                    </button>

                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch('/api/documents/parse', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              fileName: 'HUD1_Settlement_Statement.pdf',
                              content: `HUD-1 Settlement Statement\nLine 101 Contract Purchase Price: $168,000.00\nLine 202 Loan Principal: $592,000.00\nLine 106 County Tax Proration: $3,420.00`,
                              projectId,
                            }),
                          });
                          const data = await res.json();
                          const result = data.result || data;
                          setSuccessMsg(`Extracted HUD Settlement Basis ($168k) and excluded non-construction tax proration ($3.4k).`);
                          setLoading(false);
                          onIntakeSuccess();
                        } catch (e: any) {
                          console.error(e);
                          setLoading(false);
                        }
                      }}
                      className="w-full p-3 rounded-xl bg-surface-900 border border-slate-700 hover:border-blue-500/50 text-left transition flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">Parse HUD Settlement Sheet</p>
                        <p className="text-[11px] text-slate-400">Keeps Purchase Basis ($168k) · Filters Tax Escrows ($3.4k)</p>
                      </div>
                      <Upload className="w-4 h-4 text-blue-400" />
                    </button>

                    {/* Real Multi-File Upload Button */}
                    <label className="w-full p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 hover:border-emerald-500 text-left transition flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-xs font-bold text-emerald-300">Upload & Analyze Real Files</p>
                        <p className="text-[11px] text-emerald-400/80">Multi-upload .xlsx, .csv, .pdf, .docx with CSI normalization</p>
                      </div>
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <input
                        type="file"
                        multiple
                        accept=".xlsx,.xls,.csv,.pdf,.doc,.docx"
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files || files.length === 0) return;
                          setLoading(true);
                          try {
                            const filePayloads = await Promise.all(
                              Array.from(files).map((file) => {
                                return new Promise<{ fileName: string; bufferBase64: string; size: number }>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    const res = reader.result as string;
                                    const base64 = res.includes(',') ? res.split(',')[1] : res;
                                    resolve({ fileName: file.name, bufferBase64: base64, size: file.size });
                                  };
                                  reader.readAsDataURL(file);
                                });
                              })
                            );

                            const res = await fetch('/api/documents/parse-batch', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ files: filePayloads, projectId }),
                            });
                            const data = await res.json();
                            const result = data.result || data;
                            setBatchReviewData(result);
                            setSuccessMsg(`Extracted ${result.summary.documentCount} file(s): ${result.normalizedSOV.length} SOV lines ($${result.summary.totalBudgetExtracted.toLocaleString()}), ${result.normalizedInvoices.length} invoices ($${result.summary.totalSpendExtracted.toLocaleString()}).`);
                            setLoading(false);
                          } catch (err: any) {
                            console.error(err);
                            setLoading(false);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Filter Rules Rules Summary Card */}
                <div className="p-4 rounded-2xl bg-surface-950 border border-slate-800 space-y-2 text-xs">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Strict Filtering Rules</h4>
                  <div className="space-y-1.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <strong>✅ KEEP & ADD:</strong> Net Current Amount Due, Approved Budget per CSI Code, Executed Change Orders, Land Acquisition Basis.
                    </div>
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <strong>❌ AVOID & REJECT:</strong> Previous Balances, Excel Subtotal Rows, Non-cash Tax Prorations, Unapproved Draft Change Orders.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* 1. Budget / SOV Intake */}
          {activeTab === 'budget' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Master Budget & Schedule of Values (SOV)</h3>
                  <p className="text-xs text-slate-400">Approved baseline contract allocations by trade category.</p>
                </div>
                <button
                  onClick={addSovRow}
                  className="px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-slate-700 text-brand-400 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Line
                </button>
              </div>

              <div className="space-y-2">
                {sovLines.map((row, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-surface-950 border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Category Name</label>
                      <input
                        type="text"
                        value={row.category}
                        onChange={(e) => {
                          const updated = [...sovLines];
                          updated[idx].category = e.target.value;
                          setSovLines(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-medium focus:border-brand-500"
                        placeholder="Trade Category"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Sub-scope / Notes</label>
                      <input
                        type="text"
                        value={row.sub_category || ''}
                        onChange={(e) => {
                          const updated = [...sovLines];
                          updated[idx].sub_category = e.target.value;
                          setSovLines(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:border-brand-500"
                        placeholder="Scope description"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Cost Code</label>
                      <input
                        type="text"
                        value={row.cost_code || ''}
                        onChange={(e) => {
                          const updated = [...sovLines];
                          updated[idx].cost_code = e.target.value;
                          setSovLines(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-300 font-mono focus:border-brand-500"
                        placeholder="00-000"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Original Amount ($)</label>
                      <input
                        type="number"
                        value={row.amount === 0 ? '' : row.amount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/^0+(?=\d)/, '');
                          const updated = [...sovLines];
                          updated[idx].amount = clean === '' ? 0 : Number(clean);
                          setSovLines(updated);
                        }}
                        placeholder="0"
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:border-brand-500"
                      />
                    </div>
                    <div className="col-span-1 text-right pt-3">
                      <button
                        onClick={() => removeSovRow(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="text-xs text-slate-400">
                  Total Baseline Budget:{' '}
                  <strong className="text-white font-mono text-sm">
                    ${sovLines.reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
                  </strong>
                </div>
                <button
                  onClick={handleSaveBudget}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {loading ? 'Saving...' : 'Save & Approve Master SOV'}
                </button>
              </div>
            </div>
          )}

          {/* 2. Invoices & Expenses Intake */}
          {activeTab === 'invoice' && (
            <form onSubmit={handleSaveInvoice} className="space-y-4 max-w-xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-white">Direct Contractor Invoice Entry</h3>
                <p className="text-xs text-slate-400">Directly posted to Spend Truth upon confirmation.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trade Category</label>
                  <input
                    type="text"
                    value={invoiceCategory}
                    onChange={(e) => setInvoiceCategory(e.target.value)}
                    required
                    className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Vendor / Subcontractor</label>
                  <input
                    type="text"
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    required
                    className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    required
                    className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                    className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-slate-300 font-medium mb-1">Work Description / Scope</label>
                <textarea
                  rows={2}
                  value={invoiceDesc}
                  onChange={(e) => setInvoiceDesc(e.target.value)}
                  className="w-full bg-surface-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-950 border border-slate-800 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="waiver"
                  checked={lienWaiver}
                  onChange={(e) => setLienWaiver(e.target.checked)}
                  className="rounded border-slate-700 text-brand-500 focus:ring-brand-500"
                />
                <label htmlFor="waiver" className="cursor-pointer font-medium">
                  Unconditional Progress Lien Waiver received and verified
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20"
              >
                {loading ? 'Posting...' : 'Post Invoice to Spend Truth'}
              </button>
            </form>
          )}

          {/* 3. Schedule & Milestones Intake */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Project Schedule & Verified Progress %</h3>
                <p className="text-xs text-slate-400">Physical percent completion verified by GC inspections.</p>
              </div>

              <div className="space-y-2">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-surface-950 border border-slate-800 grid grid-cols-12 gap-2 items-center text-xs">
                    <div className="col-span-4">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Milestone</label>
                      <input
                        type="text"
                        value={m.milestone}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].milestone = e.target.value;
                          setMilestones(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Trade</label>
                      <input
                        type="text"
                        value={m.trade}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].trade = e.target.value;
                          setMilestones(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Target Completion</label>
                      <input
                        type="date"
                        value={m.planned_end}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].planned_end = e.target.value;
                          setMilestones(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Progress %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(m.verified_progress_pct * 100)}
                        onChange={(e) => {
                          const updated = [...milestones];
                          updated[idx].verified_progress_pct = (parseFloat(e.target.value) || 0) / 100;
                          setMilestones(updated);
                        }}
                        className="w-full bg-surface-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-amber-300 font-mono font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  onClick={handleSaveSchedule}
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {loading ? 'Saving...' : 'Update Schedule & Progress Truth'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Document Extraction Review Modal */}
      {batchReviewData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full">
            <MultiDocExtractionReview
              batchResult={batchReviewData}
              mode="full"
              onClose={() => setBatchReviewData(null)}
              onApplySOV={async (items) => {
                await fetch('/api/documents/apply-batch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectId, sovLines: items }),
                });
                onIntakeSuccess();
                setBatchReviewData(null);
                setSuccessMsg(`Applied ${items.length} extracted budget lines to Master SOV.`);
              }}
              onApplyInvoices={async (items) => {
                await fetch('/api/documents/apply-batch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ projectId, invoices: items }),
                });
                onIntakeSuccess();
                setBatchReviewData(null);
                setSuccessMsg(`Imported ${items.length} extracted contractor invoices into project ledger.`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

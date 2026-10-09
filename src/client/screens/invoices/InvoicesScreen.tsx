// GroundUp AI — Dedicated Invoices & Expenses Workspace Screen
// Replaces cramped modal overlay with full-width ledger data table, batch drag-and-drop parsing, and lien waiver auditing

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  Building2,
  Trash2,
  Edit2,
  Filter,
  DollarSign,
  Download,
} from 'lucide-react';
import { Project, ProjectFourTruthsSummary, UserRole } from '../../../shared/types';
import { getProjectBudgetLines } from '../project-detail/initial-state';

interface InvoicesScreenProps {
  projects: Project[];
  summary: ProjectFourTruthsSummary | null;
  currentRole: UserRole;
}

interface InvoiceRow {
  id: string;
  vendor: string;
  category: string;
  amount: number;
  invoiceNumber: string;
  date: string;
  lienWaiver: 'COLLECTED' | 'PENDING' | 'EXEMPT';
  status: 'POSTED' | 'DRAFT' | 'NEEDS_AUDIT';
}

const INITIAL_INVOICES: InvoiceRow[] = [
  { id: 'inv-1', vendor: 'ABC Electric LLC', category: 'Electrical', amount: 68400, invoiceNumber: 'INV-4029', date: '2026-09-28', lienWaiver: 'COLLECTED', status: 'POSTED' },
  { id: 'inv-2', vendor: 'Concrete Pros Inc', category: 'Foundation & Footings', amount: 95000, invoiceNumber: 'CP-9912', date: '2026-05-15', lienWaiver: 'COLLECTED', status: 'POSTED' },
  { id: 'inv-3', vendor: 'Johnson Lumber Co', category: 'Framing', amount: 142000, invoiceNumber: 'JL-8841', date: '2026-07-08', lienWaiver: 'COLLECTED', status: 'POSTED' },
  { id: 'inv-4', vendor: 'NJ Pipe Services LLC', category: 'Rough Plumbing', amount: 28400, invoiceNumber: 'INV-2026-0982', date: '2026-09-28', lienWaiver: 'PENDING', status: 'NEEDS_AUDIT' },
  { id: 'inv-5', vendor: 'Tri-State Roofing', category: 'Exterior Waterproofing', amount: 45000, invoiceNumber: 'TR-1029', date: '2026-08-14', lienWaiver: 'COLLECTED', status: 'POSTED' },
  { id: 'inv-6', vendor: 'Hoboken Steel Supply', category: 'Structural Steel', amount: 52000, invoiceNumber: 'HS-5521', date: '2026-06-20', lienWaiver: 'COLLECTED', status: 'POSTED' },
];

const fmt = (n: number) => '$' + n.toLocaleString();

export function InvoicesScreen({
  projects,
  summary,
  currentRole,
}: InvoicesScreenProps) {
  const { projectId } = useParams<{ projectId?: string }>();
  const navigate = useNavigate();

  const activeProjectId = projectId || projects[0]?.id || 'proj-73-broadway';
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const projectName = activeProject?.name || summary?.project_name || '73 Broadway, Hoboken';

  const budgetLines = getProjectBudgetLines(activeProjectId);
  const categories = budgetLines.map(b => b.category);

  const [invoices, setInvoices] = useState<InvoiceRow[]>(INITIAL_INVOICES);
  const [activeTab, setActiveTab] = useState<'ledger' | 'batch'>('ledger');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Inline Add Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [vendor, setVendor] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Framing');
  const [amount, setAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [lienWaiver, setLienWaiver] = useState<'COLLECTED' | 'PENDING' | 'EXEMPT'>('COLLECTED');

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collectedWaiversCount = invoices.filter(i => i.lienWaiver === 'COLLECTED').length;
  const waiverPct = Math.round((collectedWaiversCount / (invoices.length || 1)) * 100);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || inv.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSaveNewInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount) || 0;
    if (!vendor || parsedAmt <= 0) return;

    const newInv: InvoiceRow = {
      id: `inv-${Date.now()}`,
      vendor,
      category,
      amount: parsedAmt,
      invoiceNumber: invoiceNumber || `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      date,
      lienWaiver,
      status: 'POSTED',
    };

    setInvoices([newInv, ...invoices]);
    setIsAddingNew(false);
    setVendor('');
    setAmount('');
    setInvoiceNumber('');
  };

  const handleDelete = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

  return (
    <div className="min-h-full bg-slate-50 flex flex-col w-full pb-16 select-none">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/projects/${activeProjectId}/overview`)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title="Back to Project Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">{projectName}</span>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-slate-900">Invoices & Expense Ledger</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <span>Direct Expenses & Subcontractor Invoices</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Spend Truth
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddingNew(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Record New Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-6 w-full flex-1 flex flex-col gap-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Invoices</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{fmt(totalInvoiced)}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{invoices.length} line items posted to ledger</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lien Waivers Compliance</div>
            <div className="text-xl font-bold font-mono text-emerald-700 mt-1">{waiverPct}% Verified</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{collectedWaiversCount} of {invoices.length} unconditional waivers collected</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lender Draw Matching</div>
            <div className="text-xl font-bold text-indigo-700 mt-1">100% Reconciled</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Matched with AIA G702 / G703 master schedule</div>
          </div>
        </div>

        {/* Tab Toggle: Ledger vs Batch Dropzone */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Manual Expense Ledger ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Batch Document Intake (.pdf, .xlsx)
            </button>
          </div>

          {activeTab === 'ledger' && (
            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search vendor or invoice..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
              >
                <option value="ALL">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Add New Invoice Form Box */}
        {isAddingNew && (
          <form onSubmit={handleSaveNewInvoice} className="bg-white border-2 border-emerald-500/50 rounded-2xl p-5 shadow-md space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Post New Contractor Invoice to Spend Truth</h3>
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contractor / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Electrical Services"
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Budget Category</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Invoice Amount ($)</label>
                <input
                  type="number"
                  required
                  placeholder="45000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice #</label>
                <input
                  type="text"
                  placeholder="INV-001"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lien Waiver Status</label>
                <select
                  value={lienWaiver}
                  onChange={e => setLienWaiver(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white"
                >
                  <option value="COLLECTED">Collected & Verified (AIA G706)</option>
                  <option value="PENDING">Pending Submittal</option>
                  <option value="EXEMPT">Exempt / Not Applicable</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Save & Post to Ledger
              </button>
            </div>
          </form>
        )}

        {/* Ledger Table */}
        {activeTab === 'ledger' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Vendor</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">Invoice #</th>
                  <th className="px-4 py-3 text-left">Lien Waiver</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono text-slate-500">{inv.date}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{inv.vendor}</td>
                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                        {inv.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.lienWaiver === 'COLLECTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.lienWaiver === 'COLLECTED' ? '✓ Verified' : '⚠️ Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">{fmt(inv.amount)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Batch Dropzone Tab */}
        {activeTab === 'batch' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Drag and drop invoice PDFs, AIA G702s, or Excel sheets</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                GroundUp AI OCR will parse line items, identify KEEP vs AVOID figures, and map directly to your budget schedule.
              </p>
            </div>
            <button
              onClick={() => navigate(`/projects/${activeProjectId}/documents`)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Go to Document Inbox & Staging Queue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// GroundUp AI — Interactive Invoice & Multi-Document Expense Manager Modal
// Supports Method 1: Direct Line-Item Entry & Method 2: Document File Upload (.pdf, .doc, .zip, .excel, .aiag702, .aiag703)
// Recalculates Spend Truth and Four Truths with zero hallucination

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Building,
  Upload,
  UploadCloud,
  FileSpreadsheet,
  FileArchive,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Expense } from '../../shared/types';

interface InvoiceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  actorName: string;
  actorCompany: string;
  onInvoiceChanged: () => void;
}

interface UploadedDocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'DOC' | 'ZIP' | 'EXCEL' | 'AIA G702' | 'AIA G703';
  vendor: string;
  category: string;
  amount: number;
  waiver: boolean;
  status: 'EXTRACTED' | 'PARSED' | 'PENDING';
}

export function InvoiceManagerModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  actorName,
  actorCompany,
  onInvoiceChanged,
}: InvoiceManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'file_upload'>('manual');
  const [invoices, setInvoices] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State for Manual Add / Edit
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState('Framing & Trusses');
  const [amount, setAmount] = useState<number>(0);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [lienWaiver, setLienWaiver] = useState(true);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // File Upload State
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocumentItem[]>([]);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Pre-construction & Permits',
    'Site Work & Demolition',
    'Foundation & Concrete',
    'Framing & Trusses',
    'MEP Rough-in',
    'Drywall & Insulation',
    'Exterior & Roofing',
    'Interior Finishes',
    'Contingency',
  ];

  const fetchInvoices = () => {
    setIsLoading(true);
    fetch(`/api/projects/${projectId}/invoices`)
      .then((res) => res.json())
      .then((data: Expense[]) => {
        setIsLoading(false);
        setInvoices(data || []);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error('Failed to load invoices', err);
      });
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchInvoices();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingInvoiceId(null);
    setVendorName('');
    setCategory('Framing & Trusses');
    setAmount(0);
    setInvoiceNumber(`INV-2026-${Math.floor(10 + Math.random() * 90)}`);
    setDescription('');
    setLienWaiver(true);
    setIsAddingNew(true);
  };

  const handleStartEdit = (inv: Expense) => {
    setIsAddingNew(false);
    setEditingInvoiceId(inv.id);
    setVendorName(inv.vendor_name);
    setCategory(inv.category);
    setAmount(inv.amount);
    setInvoiceNumber(inv.invoice_id || '');
    setDescription(inv.description || '');
    setLienWaiver(Boolean(inv.lien_waiver_received));
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingInvoiceId(null);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || amount <= 0) {
      alert('Please provide a vendor name and valid amount.');
      return;
    }

    if (isAddingNew) {
      // Create new invoice
      fetch(`/api/projects/${projectId}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceData: {
            vendor_name: vendorName,
            category,
            amount: Number(amount),
            invoice_id: invoiceNumber,
            description,
            lien_waiver_received: lienWaiver,
            expense_date: new Date().toISOString().split('T')[0],
            source_ref: `Invoice #${invoiceNumber} · Manual Entry by ${actorName}`,
          },
          actorName,
          actorRole: 'ACCOUNTANT',
        }),
      })
        .then((res) => res.json())
        .then(() => {
          fetchInvoices();
          onInvoiceChanged();
          handleCancelForm();
        })
        .catch((err) => console.error('Failed to add invoice', err));
    } else if (editingInvoiceId) {
      // Update invoice
      fetch(`/api/invoices/${editingInvoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: {
            vendor_name: vendorName,
            category,
            amount: Number(amount),
            invoice_id: invoiceNumber,
            description,
            lien_waiver_received: lienWaiver,
          },
          actorName,
          actorRole: 'ACCOUNTANT',
        }),
      })
        .then((res) => res.json())
        .then(() => {
          fetchInvoices();
          onInvoiceChanged();
          handleCancelForm();
        })
        .catch((err) => console.error('Failed to update invoice', err));
    }
  };

  const handleDeleteInvoice = (id: string, vendor: string) => {
    if (confirm(`Delete invoice for "${vendor}"? This will update Spend Truth and fronting cash.`)) {
      fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actorName }),
      })
        .then((res) => res.json())
        .then(() => {
          fetchInvoices();
          onInvoiceChanged();
        })
        .catch((err) => console.error('Failed to delete invoice', err));
    }
  };

  // Helper: Read file as Base64 preserving binary structures
  const readFileAsBase64 = (file: File): Promise<{ fileName: string; bufferBase64: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve({ fileName: file.name, bufferBase64: base64, size: file.size });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Method 2: Multi-Document Upload Batch Extraction
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingDoc(true);
    try {
      const filePayloads = await Promise.all(Array.from(files).map(readFileAsBase64));
      const res = await fetch('/api/documents/parse-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filePayloads, projectId }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data?.error || `Server returned error status ${res.status}`);
      }
      if (data.success && data.normalizedInvoices) {
        const newItems: UploadedDocumentItem[] = data.normalizedInvoices.map((inv: any, idx: number) => ({
          id: `doc-${Date.now()}-${idx}`,
          name: inv.sourceDocument || 'Uploaded Invoice',
          size: `${((filePayloads.find((f) => f.fileName === inv.sourceDocument)?.size || 102400) / 1024).toFixed(1)} KB`,
          type: inv.sourceDocument?.toLowerCase().includes('702') ? 'AIA G702' : inv.sourceDocument?.toLowerCase().includes('703') ? 'AIA G703' : 'PDF',
          vendor: inv.vendor,
          category: inv.category,
          amount: inv.amount,
          waiver: inv.lienWaiver,
          status: 'EXTRACTED',
        }));
        setUploadedDocs((prev) => [...prev, ...newItems]);
      }
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsProcessingDoc(false);
    }
  };

  const handleImportExtractedDocs = async () => {
    if (uploadedDocs.length === 0) return;

    try {
      await fetch('/api/documents/apply-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          invoices: uploadedDocs.map((doc, idx) => ({
            vendor_name: doc.vendor,
            category: doc.category,
            amount: doc.amount,
            invoice_id: `INV-DOC-${Math.floor(100 + idx * 10)}`,
            description: `Extracted from ${doc.name} (${doc.type})`,
            lien_waiver_received: doc.waiver,
            expense_date: new Date().toISOString().split('T')[0],
          })),
          actorName,
          actorRole: 'ACCOUNTANT',
        }),
      });

      setUploadedDocs([]);
      fetchInvoices();
      onInvoiceChanged();
      setActiveTab('manual');
      alert(`Successfully imported ${uploadedDocs.length} extracted invoices into the live ledger!`);
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to import invoices into ledger.');
    }
  };

  const totalPostedSpend = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalExtractedSpend = uploadedDocs.reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Invoices & Direct Expenses Ledger</h2>
              <p className="text-xs text-slate-500">
                Project: <strong>{projectName}</strong> · Incurred Spend updates live
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Method Tab Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Method 1: Live Invoice Ledger ({invoices.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('file_upload')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'file_upload'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
              <span>Method 2: Upload Documents (PDF / DOC / ZIP / Excel / AIA)</span>
              {uploadedDocs.length > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                  {uploadedDocs.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500">Total Posted Spend:</span>
            <span className="ml-1.5 text-xs font-extrabold text-slate-900">${totalPostedSpend.toLocaleString()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: METHOD 1 - MANUAL ENTRY & EDIT */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              {/* Add / Edit Form Drawer */}
              {(isAddingNew || editingInvoiceId) && (
                <form onSubmit={handleSaveInvoice} className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="text-xs font-bold text-slate-900">
                      {isAddingNew ? '+ Add New Contractor Invoice' : 'Edit Invoice Details'}
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vendor / Subcontractor</label>
                      <input
                        type="text"
                        value={vendorName}
                        onChange={(e) => setVendorName(e.target.value)}
                        placeholder="e.g. Titan Concrete LLC"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Budget Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Amount ($)</label>
                      <input
                        type="number"
                        value={amount === 0 ? '' : amount}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const clean = e.target.value.replace(/^0+(?=\d)/, '');
                          setAmount(clean === '' ? 0 : Number(clean));
                        }}
                        placeholder="0"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Invoice Number</label>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        placeholder="INV-4921"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scope Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Slab pour, trusses, rough-in materials..."
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lienWaiver}
                        onChange={(e) => setLienWaiver(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Lien Waiver Received & Verified</span>
                    </label>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer"
                    >
                      {isAddingNew ? 'Post Invoice to Ledger' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Current Invoices ({invoices.length})</span>
                {!isAddingNew && !editingInvoiceId && (
                  <button
                    onClick={handleStartAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Single Invoice</span>
                  </button>
                )}
              </div>

              {/* Invoices Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase">
                      <th className="py-2.5 px-3">VENDOR</th>
                      <th className="py-2.5 px-3">CATEGORY</th>
                      <th className="py-2.5 px-3">INV #</th>
                      <th className="py-2.5 px-3 text-right">AMOUNT</th>
                      <th className="py-2.5 px-3 text-center">WAIVER</th>
                      <th className="py-2.5 px-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {inv.vendor_name}
                          <p className="text-[10px] text-slate-400 font-normal">{inv.description}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {inv.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {inv.invoice_id || '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ${inv.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {inv.lien_waiver_received ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-amber-200">
                              <AlertCircle className="w-3 h-3 text-amber-500" /> Missing
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right space-x-1">
                          <button
                            onClick={() => handleStartEdit(inv)}
                            className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.vendor_name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: METHOD 2 - DOCUMENT & MULTI-FILE UPLOAD DROPZONE */}
          {activeTab === 'file_upload' && (
            <div className="space-y-6">
              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/70 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    {isProcessingDoc ? 'Processing & Extracting Documents...' : 'Click or Drag Documents Here to Auto-Extract'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supports <strong>.pdf</strong>, <strong>.doc</strong>, <strong>.zip</strong>, <strong>.xlsx / .csv</strong>, <strong>.aiag702</strong> & <strong>.aiag703</strong>
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.zip,.xlsx,.xls,.csv,.aiag702,.aiag703"
                  onChange={handleFilesSelected}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2 text-[10px] font-semibold text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">PDF Invoices</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">AIA G702 / G703</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Excel SOV / Ledgers</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">Word Contracts</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">ZIP Draw Packets</span>
                </div>
              </div>

              {/* Extracted Documents List */}
              {uploadedDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-slate-900">
                        Extracted Line Items ({uploadedDocs.length}) · Total: ${totalExtractedSpend.toLocaleString()}
                      </h4>
                    </div>

                    <button
                      onClick={handleImportExtractedDocs}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Import All into Live Ledger</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {uploadedDocs.map((doc) => (
                      <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {doc.type}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{doc.name}</p>
                            <p className="text-[11px] text-slate-500">
                              Vendor: <strong>{doc.vendor}</strong> · Category: {doc.category} · {doc.size}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-slate-900 text-sm">${doc.amount.toLocaleString()}</span>
                          <button
                            onClick={() => setUploadedDocs((prev) => prev.filter((d) => d.id !== doc.id))}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

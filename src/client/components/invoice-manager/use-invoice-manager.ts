import { useState, useEffect, useRef } from 'react';
import { Expense } from '../../../shared/types';
import { services } from '../../../services';
import { UploadedDocumentItem } from './types';
import { parseUploadedFiles } from './invoice-doc-parser';
import {
  saveInvoiceToLedger,
  deleteInvoiceFromLedger,
  importExtractedDocsToLedger,
} from './use-invoice-actions';

export function useInvoiceManager(
  isOpen: boolean,
  projectId: string,
  actorName: string,
  onInvoiceChanged: () => void
) {
  const [activeTab, setActiveTab] = useState<'manual' | 'file_upload'>('manual');
  const [invoices, setInvoices] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
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

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await services.invoices.getProjectInvoices(projectId);
      setIsLoading(false);
      setInvoices(data || []);
    } catch (err) {
      setIsLoading(false);
      console.error('Failed to load invoices', err);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchInvoices();
    }
  }, [isOpen, projectId]);

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

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || amount <= 0) {
      alert('Please provide a vendor name and valid amount.');
      return;
    }

    await saveInvoiceToLedger({
      isAddingNew,
      editingInvoiceId,
      projectId,
      vendorName,
      category,
      amount,
      invoiceNumber,
      description,
      lienWaiver,
      actorName,
      fetchInvoices,
      onInvoiceChanged,
      handleCancelForm,
    });
  };

  const handleDeleteInvoice = async (id: string, vendor: string) => {
    await deleteInvoiceFromLedger(id, vendor, actorName, fetchInvoices, onInvoiceChanged);
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingDoc(true);
    try {
      const items = await parseUploadedFiles(files, projectId);
      setUploadedDocs((prev) => [...prev, ...items]);
    } catch (err) {
      console.error('Extraction error:', err);
    } finally {
      setIsProcessingDoc(false);
    }
  };

  const handleImportExtractedDocs = async () => {
    await importExtractedDocsToLedger(
      uploadedDocs,
      projectId,
      actorName,
      setUploadedDocs,
      fetchInvoices,
      onInvoiceChanged,
      setActiveTab
    );
  };

  return {
    activeTab,
    setActiveTab,
    invoices,
    isLoading,
    isAddingNew,
    editingInvoiceId,
    vendorName,
    setVendorName,
    category,
    setCategory,
    amount,
    setAmount,
    invoiceNumber,
    setInvoiceNumber,
    description,
    setDescription,
    lienWaiver,
    setLienWaiver,
    uploadedDocs,
    setUploadedDocs,
    isProcessingDoc,
    fileInputRef,
    handleStartAdd,
    handleStartEdit,
    handleCancelForm,
    handleSaveInvoice,
    handleDeleteInvoice,
    handleFilesSelected,
    handleImportExtractedDocs,
  };
}

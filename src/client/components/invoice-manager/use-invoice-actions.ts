import { services } from '../../../services';
import { Expense } from '../../../shared/types';
import { UploadedDocumentItem } from './types';

interface SaveInvoiceParams {
  isAddingNew: boolean;
  editingInvoiceId: string | null;
  projectId: string;
  vendorName: string;
  category: string;
  amount: number;
  invoiceNumber: string;
  description: string;
  lienWaiver: boolean;
  actorName: string;
  fetchInvoices: () => Promise<void>;
  onInvoiceChanged: () => void;
  handleCancelForm: () => void;
}

export async function saveInvoiceToLedger({
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
}: SaveInvoiceParams) {
  try {
    if (isAddingNew) {
      await services.invoices.addInvoice(
        projectId,
        {
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
        'ACCOUNTANT'
      );
    } else if (editingInvoiceId) {
      await services.invoices.updateInvoice(
        editingInvoiceId,
        {
          vendor_name: vendorName,
          category,
          amount: Number(amount),
          invoice_id: invoiceNumber,
          description,
          lien_waiver_received: lienWaiver,
        },
        actorName,
        'ACCOUNTANT'
      );
    }
    await fetchInvoices();
    onInvoiceChanged();
    handleCancelForm();
  } catch (err) {
    console.error('Failed to save invoice', err);
  }
}

export async function deleteInvoiceFromLedger(
  id: string,
  vendor: string,
  actorName: string,
  fetchInvoices: () => Promise<void>,
  onInvoiceChanged: () => void
) {
  if (confirm(`Delete invoice for "${vendor}"? This will update Spend Truth and fronting cash.`)) {
    try {
      await services.invoices.deleteInvoice(id, actorName);
      await fetchInvoices();
      onInvoiceChanged();
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  }
}

export async function importExtractedDocsToLedger(
  uploadedDocs: UploadedDocumentItem[],
  projectId: string,
  actorName: string,
  setUploadedDocs: React.Dispatch<React.SetStateAction<UploadedDocumentItem[]>>,
  fetchInvoices: () => Promise<void>,
  onInvoiceChanged: () => void,
  setActiveTab: (tab: 'manual' | 'file_upload') => void
) {
  if (uploadedDocs.length === 0) return;

  try {
    await services.documents.applyBatchDocuments({
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
    });

    setUploadedDocs([]);
    await fetchInvoices();
    onInvoiceChanged();
    setActiveTab('manual');
    alert(`Successfully imported ${uploadedDocs.length} extracted invoices into the live ledger!`);
  } catch (err) {
    console.error('Import error:', err);
    alert('Failed to import invoices into ledger.');
  }
}

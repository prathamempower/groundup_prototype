// GroundUp AI — Interactive Invoice & Multi-Document Expense Manager Modal
// Supports Method 1: Direct Line-Item Entry & Method 2: Document File Upload (.pdf, .doc, .zip, .excel, .aiag702, .aiag703)

import React from 'react';
import { InvoiceManagerModalProps } from './invoice-manager/types';
import { useInvoiceManager } from './invoice-manager/use-invoice-manager';
import { InvoiceManagerHeader } from './invoice-manager/components/InvoiceManagerHeader';
import { InvoiceMethodTabs } from './invoice-manager/components/InvoiceMethodTabs';
import { InvoiceFormDrawer } from './invoice-manager/components/InvoiceFormDrawer';
import { InvoicesTable } from './invoice-manager/components/InvoicesTable';
import { DocumentUploadDropzone } from './invoice-manager/components/DocumentUploadDropzone';
import { ExtractedDocsList } from './invoice-manager/components/ExtractedDocsList';

export function InvoiceManagerModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  actorName,
  actorCompany,
  onInvoiceChanged,
}: InvoiceManagerModalProps) {
  if (!isOpen) return null;

  const {
    activeTab,
    setActiveTab,
    invoices,
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
  } = useInvoiceManager(isOpen, projectId, actorName, onInvoiceChanged);

  const totalPostedSpend = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const totalExtractedSpend = uploadedDocs.reduce((sum, doc) => sum + doc.amount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <InvoiceManagerHeader projectName={projectName} onClose={onClose} />

        <InvoiceMethodTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          invoicesCount={invoices.length}
          uploadedDocsCount={uploadedDocs.length}
          totalPostedSpend={totalPostedSpend}
        />

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'manual' && (
            <div className="space-y-6">
              {(isAddingNew || editingInvoiceId) && (
                <InvoiceFormDrawer
                  isAddingNew={isAddingNew}
                  vendorName={vendorName}
                  setVendorName={setVendorName}
                  category={category}
                  setCategory={setCategory}
                  amount={amount}
                  setAmount={setAmount}
                  invoiceNumber={invoiceNumber}
                  setInvoiceNumber={setInvoiceNumber}
                  description={description}
                  setDescription={setDescription}
                  lienWaiver={lienWaiver}
                  setLienWaiver={setLienWaiver}
                  onCancel={handleCancelForm}
                  onSave={handleSaveInvoice}
                />
              )}

              <InvoicesTable
                invoices={invoices}
                isAddingNew={isAddingNew}
                editingInvoiceId={editingInvoiceId}
                onStartAdd={handleStartAdd}
                onStartEdit={handleStartEdit}
                onDeleteInvoice={handleDeleteInvoice}
              />
            </div>
          )}

          {activeTab === 'file_upload' && (
            <div className="space-y-6">
              <DocumentUploadDropzone
                fileInputRef={fileInputRef}
                isProcessingDoc={isProcessingDoc}
                onFilesSelected={handleFilesSelected}
              />

              <ExtractedDocsList
                uploadedDocs={uploadedDocs}
                totalExtractedSpend={totalExtractedSpend}
                onImportAll={handleImportExtractedDocs}
                onRemoveDoc={(id) => setUploadedDocs((prev) => prev.filter((d) => d.id !== id))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

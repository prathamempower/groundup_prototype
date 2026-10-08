import React from 'react';
import { MultiDocumentBatchResult } from '../types';

interface DocumentProvenanceTabProps {
  documents: MultiDocumentBatchResult['documents'];
}

export function DocumentProvenanceTab({ documents }: DocumentProvenanceTabProps) {
  return (
    <div className="p-6 space-y-4 overflow-y-auto max-h-[55vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-bold">
                {doc.documentType}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {(doc.overallConfidence * 100).toFixed(0)}% Confidence
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate">{doc.fileName}</h4>
            <div className="text-[11px] text-slate-600 space-y-1">
              {doc.loanFacility ? (
                <div className="p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-blue-950 space-y-0.5">
                  <p className="font-bold text-blue-900">🏦 Construction Loan Facility</p>
                  <p>Lender: <strong>{doc.loanFacility.lenderName}</strong></p>
                  <p>Loan Amount: <strong>${doc.loanFacility.loanAmount.toLocaleString()}</strong> @ <strong>{doc.loanFacility.interestRate}% APR</strong></p>
                  <p>Initial Advance: <strong>${doc.loanFacility.disbursedFunded.toLocaleString()}</strong> · Term: <strong>{doc.loanFacility.loanTermMonths} Mo</strong></p>
                  <p className="text-emerald-700 font-semibold">Approved Budget Exhibit: <strong>{doc.lineItems.length} Trade Lines (${doc.totalAmount.toLocaleString()})</strong></p>
                </div>
              ) : (
                <>
                  <p>Vendor: <strong>{doc.vendorName}</strong></p>
                  <p>Invoice / Ref: <strong>{doc.invoiceNumber}</strong></p>
                  <p>Valid Lines: <strong>{doc.lineItems.length}</strong> · Amount: <strong>${doc.totalAmount.toLocaleString()}</strong></p>
                </>
              )}
              <p className="text-amber-700">Excluded Figures: <strong>{doc.excludedFigures.length}</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GroundUp AI — Project Documents Intake Center
// Canonical document repository for the 7 primary documents provided by the Developer / Owner

import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  CheckCircle2, 
  Upload, 
  ShieldCheck, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  Landmark, 
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Project } from '../../shared/types';

interface DocumentIntakeScreenProps {
  projects: Project[];
  selectedProjectId: string;
}

export function DocumentIntakeScreen({
  projects,
  selectedProjectId,
}: DocumentIntakeScreenProps) {
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const [documents, setDocuments] = useState([
    {
      id: 'doc-sov',
      title: '1. Budget Sheet & Schedule of Values (SOV)',
      category: 'BUDGET_SPREADSHEET',
      fileName: '73_Broadway_SOV_v2_Approved.xlsx',
      fileSize: '1.4 MB',
      uploadedAt: 'Sep 1, 2025',
      shaHash: '8f4a1c9e...42a0',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: '12 budget lines · $1,820,000 total baseline budget · 10% contingency ($82K)',
      icon: FileSpreadsheet,
    },
    {
      id: 'doc-gc',
      title: '2. Executed General Contractor Contract',
      category: 'GC_CONTRACT',
      fileName: 'KP_Construction_AIA_A102_Executed.pdf',
      fileSize: '3.8 MB',
      uploadedAt: 'Sep 5, 2025',
      shaHash: '7b2d9f1a...991c',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: 'Commercial Model: Daily Updates / Open-Book · 12% GC Markup · Net 15 Payment Terms',
      icon: FileCheck,
    },
    {
      id: 'doc-timeline',
      title: '3. Master Construction Timeline & Gantt',
      category: 'SCHEDULE_SPREADSHEET',
      fileName: '73_Broadway_CPM_Schedule_Target_Jun2026.mpp',
      fileSize: '820 KB',
      uploadedAt: 'Sep 10, 2025',
      shaHash: '3e1c8d4a...5502',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: '12 critical path milestones · Target Completion: Jun 15, 2026',
      icon: Clock,
    },
    {
      id: 'doc-loan',
      title: '4. Construction Loan Approval Agreement',
      category: 'LOAN_APPROVAL',
      fileName: 'BCB_Bank_Commitment_Letter_Signed.pdf',
      fileSize: '2.1 MB',
      uploadedAt: 'May 1, 2025',
      shaHash: '4f8b91a2...3011',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: '$1,200,000 Facility · 9.75% APR · 18 Month Term · $75,000 Interest Reserve',
      icon: Landmark,
    },
    {
      id: 'doc-hud',
      title: '5. HUD-1 Settlement & Closing Statement',
      category: 'HUD_STATEMENT',
      fileName: 'HUD1_Settlement_73_Broadway_Closed.pdf',
      fileSize: '1.9 MB',
      uploadedAt: 'Apr 28, 2025',
      shaHash: '9a3e2c1b...8820',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: 'Purchase Price: $1,000,000 · Seller Credits: $15,000 · Title & Legal: $18,400',
      icon: FileText,
    },
    {
      id: 'doc-land',
      title: '6. Land Acquisition & Title Deed Statement',
      category: 'LAND_ACQUISITION',
      fileName: 'Hudson_County_Recorded_Deed_GroundUp.pdf',
      fileSize: '2.4 MB',
      uploadedAt: 'Apr 30, 2025',
      shaHash: '1c4e7a2b...7733',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: 'Recorded Book 9842 / Page 114 · Clean Title · Free of Liens or Encumbrances',
      icon: ShieldCheck,
    },
    {
      id: 'doc-bank',
      title: '7. Primary Project Operating Bank Statement',
      category: 'BANK_STATEMENT',
      fileName: 'BCB_Statement_August_2026.pdf',
      fileSize: '950 KB',
      uploadedAt: 'Sep 15, 2026',
      shaHash: '6d2a8c1e...1194',
      status: 'EXTRACTED_VERIFIED',
      extractedSummary: 'Starting Balance: $148,200 · 12 disbursements matched to spend ledger',
      icon: Landmark,
    },
  ]);

  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleSimulateUpload = (docId: string) => {
    setUploadSuccess(docId);
    setTimeout(() => setUploadSuccess(null), 2500);
  };

  const handleSimulateDownload = (fileName: string) => {
    setDownloadSuccess(fileName);
    setTimeout(() => setDownloadSuccess(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Toast Notification */}
      {downloadSuccess && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Downloading verified source document: <strong>{downloadSuccess}</strong> (Immutable SHA-256)</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">Ready</span>
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Developer Control Center · Document Intake
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Project Documents & Canonical Sources</h1>
          <p className="text-xs text-slate-500">
            The 7 foundational project documents provided by the Developer / Owner establishing ground truth
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>7 of 7 Canonical Documents Verified</span>
          </span>
        </div>
      </div>

      {/* Document Repository List */}
      <div className="space-y-3.5">
        {documents.map((doc) => {
          const Icon = doc.icon;
          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-slate-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 text-sm">{doc.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ AI Verified
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    File: <strong className="text-slate-900">{doc.fileName}</strong> ({doc.fileSize}) · Uploaded {doc.uploadedAt}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    {doc.extractedSummary}
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">
                    SHA256: {doc.shaHash} · Verified Immutable Source
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => handleSimulateDownload(doc.fileName)}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleSimulateUpload(doc.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadSuccess === doc.id ? 'Replaced & Re-indexed!' : 'Replace File'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

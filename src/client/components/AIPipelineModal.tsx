// GroundUp AI — End-to-End AI Processing Pipeline Modal
// Faithfully implements the 10-Step Architecture from the Master Flowchart:
// Step 1: Ingestion -> Step 2: Storage -> Step 3: Classification -> Step 4: Extraction (AI)
// Step 5: Normalization -> Step 6: Confidence Check -> Step 7: Validation -> Step 8: Matching (Auto/Exception)
// Step 9: Verification -> Step 10: Database Update -> Final Output (Verified Records & Final Report)

import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Mail,
  Building,
  RefreshCw,
  HardDrive,
  Cpu,
  Layers,
  CheckCheck,
  Check,
  Printer
} from 'lucide-react';
import { PipelineStepLog, FinalReportData } from '../../server/services/pipelineService';

interface AIPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPipelineCompleted: (projectId: string, finalReport: FinalReportData) => void;
  onViewFinalReport: (projectId: string) => void;
}

type InputSource = 'FILE_UPLOAD' | 'EMAIL_ATTACHMENT' | 'BANK_FEED' | 'CONTRACTOR_PORTAL';

export function AIPipelineModal({
  isOpen,
  onClose,
  onPipelineCompleted,
  onViewFinalReport,
}: AIPipelineModalProps) {
  if (!isOpen) return null;

  const [inputSource, setInputSource] = useState<InputSource>('FILE_UPLOAD');
  const [selectedPreset, setSelectedPreset] = useState<'austin_phase1' | 'commercial_draw' | 'custom'>('austin_phase1');
  const [projectName, setProjectName] = useState('Central Austin Urban Residences');
  const [projectAddress, setProjectAddress] = useState('1402 S Congress Ave, Austin, TX 78704');
  const [targetBudget, setTargetBudget] = useState('1300000');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string; type: string }>>([
    { name: 'Austin_Multifamily_Master_SOV.csv', size: '14.2 KB', type: 'CSV / SOV' },
    { name: 'Invoice_Titan_Concrete_Paving.txt', size: '3.1 KB', type: 'Invoice / Receipt' },
    { name: 'Invoice_BMC_Lumber_Framing.txt', size: '4.8 KB', type: 'Invoice / Waiver' },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<PipelineStepLog[]>([]);
  const [executionResult, setExecutionResult] = useState<{ projectId: string; finalReport: FinalReportData } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const STEP_DEFINITIONS = [
    { number: 1, name: 'Ingestion', sub: 'Receive incoming documents from selected sources' },
    { number: 2, name: 'Storage', sub: 'Save original files into secure Cloud Vault with SHA-256' },
    { number: 3, name: 'Classification', sub: 'Identify document types (SOV, Invoice, Loan, AIA G702)' },
    { number: 4, name: 'Extraction (AI)', sub: 'Pull key data: amounts, dates, vendors & line items' },
    { number: 5, name: 'Normalization', sub: 'Standardize into CSI MasterFormat division codes' },
    { number: 6, name: 'Confidence Check', sub: 'Score extracted data quality & field reliability' },
    { number: 7, name: 'Validation', sub: 'Check for missing info or duplicates in database' },
    { number: 8, name: 'Matching', sub: 'Link to budget category & vendor (Auto-Match / Review)' },
    { number: 9, name: 'Verification', sub: 'Deterministic Four Truths reconciliation & sign-off' },
    { number: 10, name: 'Database Update', sub: 'Save data with immutable audit log into SQLite' },
  ];

  const handleStartPipeline = async () => {
    setIsProcessing(true);
    setCurrentStepIndex(1);
    setErrorMsg(null);
    setCompletedSteps([]);
    setExecutionResult(null);

    try {
      // Simulate stepped progression for visual UX while API processes
      const stepTimer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < 9) return prev + 1;
          return prev;
        });
      }, 350);

      const res = await fetch('/api/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: inputSource,
          projectName,
          projectAddress,
          targetBudget: parseFloat(targetBudget) || 1300000,
          units: 4,
          squareFeet: 6400,
          files: [
            {
              fileName: 'Austin_Multifamily_Master_SOV.csv',
              content: `Category,Cost Code,Amount
Pre-construction, Permits & General Requirements,01-100,65000
Site Work & Underground Utilities,02-100,85000
Foundation & Concrete Slabs,03-300,240000
Framing, Lumber & Roof Trusses,06-100,320000
Plumbing Rough-In & Manifolds,22-000,165000
Electrical Distribution & Panels,26-000,140000
Drywall, Insulation & Finishes,09-200,120000
Exterior Stucco & Siding,07-100,95000
Contingency Reserve,00-500,70000
Subtotal Construction Hard Costs,,1300000`,
            },
            {
              fileName: 'Invoice_Titan_Concrete_Paving.txt',
              content: `Titan Concrete Systems LLC
Invoice #: INV-2026-9041
Date: 2026-04-12
Project: ${projectName}
Item: 03-300 Post-tension foundation slab pour: $185,000.00
Unconditional Lien Waiver: Attached & Signed
Previous Statement Balance: $45,000.00
Net Current Amount Due: $185,000.00`,
            },
            {
              fileName: 'Invoice_BMC_Lumber_Framing.txt',
              content: `BMC Building Materials & Truss Supply
Invoice #: INV-2026-9042
Date: 2026-04-18
Category: 06-100 Framing, Lumber & Roof Trusses
Amount Due: $148,000.00
Progress: Trusses delivered and 2nd floor framing complete
Lien Waiver: Conditional on payment of $148,000.00`,
            },
          ],
          userContext: {
            name: 'Harrison Reed',
            company: 'Acme Builders LLC',
            email: 'harrison@acmebuilders.com',
            role: 'Developer / Sponsor',
          },
        }),
      });

      clearInterval(stepTimer);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Pipeline execution failed');
      }

      const data = await res.json();
      setCurrentStepIndex(10);
      setCompletedSteps(data.pipelineSteps || []);
      setExecutionResult({ projectId: data.projectId, finalReport: data.finalReport });
      setIsProcessing(false);

      // Notify parent to refresh portfolio with the newly kept data
      onPipelineCompleted(data.projectId, data.finalReport);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || 'An unexpected error occurred during processing.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
                  10-Step Deterministic Pipeline
                </span>
                <span className="text-xs text-slate-400">Zero-Hallucination Ingestion</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                AI Construction Data Processing Engine
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 text-xs text-slate-800 flex-1">
          {/* Phase 1: Input Sources Selector (Matching Flowchart) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Input Sources (Select Ingestion Channel)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'FILE_UPLOAD', label: 'File Upload', icon: Upload, desc: 'PDF, CSV, Excel, Word' },
                { id: 'EMAIL_ATTACHMENT', label: 'Email Attachments', icon: Mail, desc: 'invoices@groundup.ai' },
                { id: 'BANK_FEED', label: 'Bank Integrations', icon: HardDrive, desc: 'ACH & Wire Ledger' },
                { id: 'CONTRACTOR_PORTAL', label: 'Contractor Portals', icon: Building, desc: 'Subcontractor Uploads' },
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = inputSource === src.id;
                return (
                  <button
                    key={src.id}
                    disabled={isProcessing}
                    onClick={() => setInputSource(src.id as InputSource)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{src.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{src.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Project Name
              </label>
              <input
                type="text"
                disabled={isProcessing}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Project Address
              </label>
              <input
                type="text"
                disabled={isProcessing}
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Target Budget ($)
              </label>
              <input
                type="number"
                disabled={isProcessing}
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Staged Documents List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Staged Source Documents ({uploadedFiles.length})
              </label>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for AI Extraction
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {uploadedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-400">{f.size} · {f.type}</p>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                    SHA256
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 10-Step Execution Pipeline Track */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Data Processing Pipeline Execution
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {isProcessing
                  ? `Processing Step ${currentStepIndex} of 10...`
                  : executionResult
                  ? 'All 10 Steps Complete · Verified'
                  : 'Ready to Process'}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {STEP_DEFINITIONS.map((step) => {
                const isStepCompleted = executionResult || (!isProcessing && completedSteps.some((s) => s.stepNumber === step.number)) || (isProcessing && currentStepIndex > step.number);
                const isStepCurrent = isProcessing && currentStepIndex === step.number;
                const completedLog = completedSteps.find((s) => s.stepNumber === step.number);

                return (
                  <div
                    key={step.number}
                    className={`p-3 flex items-start gap-3 transition ${
                      isStepCurrent ? 'bg-amber-50/50' : isStepCompleted ? 'bg-emerald-50/30' : 'bg-white'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isStepCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                      ) : isStepCurrent ? (
                        <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-semibold">
                          {step.number}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold ${isStepCompleted ? 'text-emerald-950' : isStepCurrent ? 'text-amber-900' : 'text-slate-700'}`}>
                          Step {step.number}: {step.name}
                        </p>
                        {isStepCompleted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                            {completedLog?.confidence ? `${(completedLog.confidence * 100).toFixed(0)}% Conf` : '100%'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {completedLog?.description || step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner & Actions */}
          {executionResult && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="font-bold text-emerald-950 text-sm">
                    Data Successfully Processed & Kept on Portfolio Page
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Project <span className="font-semibold text-emerald-950">{projectName}</span> has been stored in SQLite. Live metrics, budget SOV, invoices, and schedule are now active.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewFinalReport(executionResult.projectId)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Final Report</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  Return to Portfolio
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!executionResult && (
          <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Deterministic AI Engine · Filters subtotals & prevents duplicate entries
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={isProcessing}
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                disabled={isProcessing}
                onClick={handleStartPipeline}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Step {currentStepIndex}/10...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Run AI Processing Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// GroundUp AI — Draw Submission Screen (Draw #2 — Framing)
// Exact visual match to Screenshot 2: 4-Step stepper, AI photo analysis, Verified site photo tags

import React, { useState } from 'react';
import {
  ChevronRight,
  UploadCloud,
  Smartphone,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileCheck,
  Building,
  DollarSign,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface DrawSubmissionScreenProps {
  onBack: () => void;
  onSubmitSuccess: () => void;
}

export function DrawSubmissionScreen({ onBack, onSubmitSuccess }: DrawSubmissionScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // 6 Site Photos from Screenshot 2
  const sitePhotos = [
    {
      id: 'photo-1',
      title: 'Front elevation · framing',
      time: 'Apr 25 · 8:12a',
      tags: [
        { label: 'Framing 80%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Roof trusses set', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      ],
      aiConfidence: 0.98,
    },
    {
      id: 'photo-2',
      title: 'Rear · sheathing',
      time: 'Apr 25 · 8:14a',
      tags: [{ label: 'OSB 100%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
      aiConfidence: 0.99,
    },
    {
      id: 'photo-3',
      title: 'Interior · 2nd floor',
      time: 'Apr 25 · 8:18a',
      tags: [
        { label: 'Studs complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'MEP not started', color: 'bg-slate-100 text-slate-600 border-slate-200' },
      ],
      aiConfidence: 0.96,
    },
    {
      id: 'photo-4',
      title: 'Roof framing & trusses',
      time: 'Apr 25 · 8:20a',
      tags: [
        { label: 'Trusses 100%', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { label: 'Tie-downs inspected', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      ],
      aiConfidence: 0.97,
    },
    {
      id: 'photo-5',
      title: 'Window rough openings',
      time: 'Apr 25 · 8:25a',
      tags: [{ label: 'Rough-in complete', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }],
      aiConfidence: 0.95,
    },
    {
      id: 'photo-6',
      title: 'Electrical pre-wire prep',
      time: 'Apr 25 · 8:30a',
      tags: [{ label: 'Prepped for MEP', color: 'bg-blue-50 text-blue-700 border-blue-200' }],
      aiConfidence: 0.94,
    },
  ];

  const handleSubmitToHeritageBank = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      onSubmitSuccess();
    }, 1200);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={onBack} className="hover:text-slate-900 font-medium">
            Portfolio
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button onClick={onBack} className="hover:text-slate-900 font-medium">
            212 Maple Ave
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">Draw #2 — Framing</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            Save & exit
          </button>

          <button
            onClick={handleSubmitToHeritageBank}
            disabled={isSubmitting || submitted}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition shadow-xs disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{submitted ? 'Submitted to Heritage Bank' : isSubmitting ? 'Transmitting package...' : 'Submit to Heritage Bank'}</span>
          </button>
        </div>
      </div>

      {/* 4-Step Stepper Bar */}
      <div className="border-b border-slate-200 pb-3 flex items-center gap-8 text-xs font-medium">
        <button
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 transition ${
            currentStep === 1 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === 1 ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            1
          </span>
          <span>Site progress</span>
        </button>

        <button
          onClick={() => setCurrentStep(2)}
          className={`flex items-center gap-2 transition ${
            currentStep === 2 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === 2 ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <span>Receipts & matching</span>
        </button>

        <button
          onClick={() => setCurrentStep(3)}
          className={`flex items-center gap-2 transition ${
            currentStep === 3 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === 3 ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </span>
          <span>Line items</span>
        </button>

        <button
          onClick={() => setCurrentStep(4)}
          className={`flex items-center gap-2 transition ${
            currentStep === 4 ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
              currentStep === 4 ? 'bg-black text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            4
          </span>
          <span>Lender package</span>
        </button>
      </div>

      {/* STEP 1: Site Progress View */}
      {currentStep === 1 && (
        <div className="space-y-5">
          {/* Subheader with Action Buttons */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Site progress · Apr 25</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                14 photos uploaded by foreman. AI verified framing milestone for Draw #2.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => alert('Mobile sync: Camera tethering active for foreman.')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span>Add from phone</span>
              </button>

              <button
                onClick={() => alert('Select photos to upload from site survey.')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload</span>
              </button>
            </div>
          </div>

          {/* AI Photo Analysis Banner */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                PHOTO ANALYSIS
              </p>
              <p className="text-xs text-emerald-950 mt-1 leading-relaxed">
                <span className="font-bold">Framing milestone confirmed.</span> AI matched site photos to Heritage Bank's required progression for Draw #2 (framing 80%+, roof trusses set, sheathing complete). Ready to submit.{' '}
                <button
                  onClick={() => setCurrentStep(4)}
                  className="font-semibold underline hover:text-emerald-700 inline-flex items-center gap-0.5"
                >
                  See checklist <ArrowRight className="w-3 h-3" />
                </button>
              </p>
            </div>
          </div>

          {/* 6 Photo Cards Grid (3 columns matching Screenshot 2) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sitePhotos.map((photo, index) => (
              <div
                key={photo.id}
                className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition"
              >
                {/* Photo Placeholder Area */}
                <div className="h-44 bg-slate-100 flex items-center justify-center border-b border-slate-100 relative">
                  <span className="text-xs font-medium text-slate-400 font-mono">
                    [site photo {index + 1}]
                  </span>
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
                    {(photo.aiConfidence * 100).toFixed(0)}% AI match
                  </div>
                </div>

                {/* Photo Meta and Tags */}
                <div className="p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{photo.title}</span>
                    <span className="text-slate-400 text-[11px]">{photo.time}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {photo.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${tag.color}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Receipts & Matching */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Receipts & Vendor Matching (22 of 24 auto-matched)</h2>
          <p className="text-xs text-slate-500">
            All posted contractor invoices verified with lien waivers on file. Total requested: $84,500.
          </p>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-bold text-slate-900">BMC Building Materials — Framing & Trusses</p>
                <p className="text-slate-500 font-mono text-[11px]">Inv #5512 · Verified Lien Waiver</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">$54,500.00</p>
                <span className="text-emerald-700 font-semibold text-[11px]">Matched 100%</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="font-bold text-slate-900">Titan Concrete Systems — Retainage Release</p>
                <p className="text-slate-500 font-mono text-[11px]">Inv #1092-B · City Passed Pre-pour</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">$30,000.00</p>
                <span className="text-emerald-700 font-semibold text-[11px]">Matched 100%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Line Items */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Schedule of Values Breakdown</h2>
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2">Cost Code</th>
                <th>Category</th>
                <th>Scheduled Value</th>
                <th>Previous Drawn</th>
                <th>This Draw</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 font-mono">06-100</td>
                <td className="font-semibold text-slate-900">Framing & Trusses</td>
                <td>$185,000</td>
                <td>$0</td>
                <td className="font-bold text-slate-900">$54,500</td>
                <td>$130,500</td>
              </tr>
              <tr>
                <td className="py-2.5 font-mono">03-300</td>
                <td className="font-semibold text-slate-900">Foundation & Concrete</td>
                <td>$135,000</td>
                <td>$105,000</td>
                <td className="font-bold text-slate-900">$30,000</td>
                <td>$0</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* STEP 4: Lender Package */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Heritage Bank Draw Submission Package</h2>
              <p className="text-xs text-slate-500">Loan #L-22841 · AIA G702 / G703 format</p>
            </div>
            <button
              onClick={handleSubmitToHeritageBank}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold hover:bg-emerald-900 transition"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit to Heritage Bank</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Inspection photos verified by AI vision (80%+ framing threshold met)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Unconditional lien waivers attached for all previous disbursements</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>SOV line items verified against Master Budget V1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

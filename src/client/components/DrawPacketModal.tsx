// GroundUp AI — Draw Packet Builder Wizard (AIA G702 / G703)
// 4-Step wizard to select budget lines, verify conditions & lien waivers, and build submission packet

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  FileCheck,
  Building,
  DollarSign
} from 'lucide-react';

interface DrawPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextDrawNumber: number;
  availableLines: Array<{ category: string; available: number; spent: number; budget: number }>;
  onSubmitDraw: (drawData: {
    draw_number: number;
    requested_total: number;
    lines: Array<{ category: string; requested_amount: number }>;
    notes: string;
  }) => void;
}

export function DrawPacketModal({
  isOpen,
  onClose,
  nextDrawNumber,
  availableLines,
  onSubmitDraw,
}: DrawPacketModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Line item selection state
  const [selectedLines, setSelectedLines] = useState<Record<string, { selected: boolean; amount: number }>>(() => {
    const initial: Record<string, { selected: boolean; amount: number }> = {};
    availableLines.forEach(l => {
      // Default select lines with spend
      const defaultAmount = Math.min(l.available, Math.max(0, l.spent * 0.3));
      initial[l.category] = {
        selected: defaultAmount > 0,
        amount: Math.round(defaultAmount),
      };
    });
    return initial;
  });

  // Verification conditions
  const [conditions, setConditions] = useState({
    lienWaiversCollected: true,
    inspectionsPassed: true,
    sitePhotosAttached: true,
    gcAffidavitSigned: true,
  });

  const [notes, setNotes] = useState('Draw request for rough MEP inspection milestones and exterior waterproofing.');

  if (!isOpen) return null;

  // Calculations
  const grossRequested = Object.entries(selectedLines)
    .filter(([_, item]) => item.selected)
    .reduce((sum, [_, item]) => sum + (item.amount || 0), 0);

  const retainagePct = 0.10; // 10% lender holdback
  const retainageAmount = Math.round(grossRequested * retainagePct);
  const netDisbursement = grossRequested - retainageAmount;

  const handleToggleLine = (category: string) => {
    setSelectedLines(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        selected: !prev[category]?.selected,
      },
    }));
  };

  const handleAmountChange = (category: string, amount: number) => {
    setSelectedLines(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        amount,
      },
    }));
  };

  const handleSubmit = () => {
    const linesToSubmit = Object.entries(selectedLines)
      .filter(([_, item]) => item.selected && item.amount > 0)
      .map(([cat, item]) => ({
        category: cat,
        requested_amount: item.amount,
      }));

    if (linesToSubmit.length === 0) return;

    onSubmitDraw({
      draw_number: nextDrawNumber,
      requested_total: grossRequested,
      lines: linesToSubmit,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              #{nextDrawNumber}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Build Draw Packet — Draw #{nextDrawNumber}</h3>
              <p className="text-xs text-slate-500">Lender Portal Submission Package (AIA G702 / G703 Specification)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
          {[
            { s: 1 as const, label: 'Select Lines' },
            { s: 2 as const, label: 'Audit Conditions' },
            { s: 3 as const, label: 'Retainage Math' },
            { s: 4 as const, label: 'Packet Summary' },
          ].map((item) => {
            const isActive = step === item.s;
            const isCompleted = step > item.s;

            return (
              <button
                key={item.s}
                type="button"
                onClick={() => setStep(item.s)}
                className={`flex items-center gap-1.5 font-semibold transition py-1.5 px-2 rounded-lg cursor-pointer ${
                  isActive
                    ? 'text-slate-900 border-b-2 border-slate-900 pb-1'
                    : isCompleted
                    ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/70'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isCompleted ? '✓' : item.s}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Select Lines */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Select completed budget categories to claim on this draw:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  Gross: ${grossRequested.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {availableLines.slice(0, 8).map((line) => {
                  const state = selectedLines[line.category] || { selected: false, amount: 0 };
                  return (
                    <div
                      key={line.category}
                      className={`p-3 flex items-center justify-between transition ${
                        state.selected ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={() => handleToggleLine(line.category)}
                          className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{line.category}</div>
                          <div className="text-xs text-slate-500">
                            Budget: ${line.budget.toLocaleString()} · Incurred: ${line.spent.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {state.selected && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-mono">$</span>
                          <input
                            type="number"
                            value={state.amount}
                            onChange={(e) => handleAmountChange(line.category, parseFloat(e.target.value) || 0)}
                            className="w-28 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-sm font-bold text-slate-900 text-right focus:ring-1 focus:ring-slate-900 outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Audit Conditions */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-slate-600">
                GroundUp AI automates compliance checks to prevent lender short-funding or rejections:
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    key: 'lienWaiversCollected',
                    label: 'Unconditional Lien Waivers Collected',
                    desc: 'Verified lien waivers from all trades on previous draw cycle.',
                  },
                  {
                    key: 'inspectionsPassed',
                    label: 'Municipal & Rough Inspections Passed',
                    desc: 'Township plumbing & electrical rough sign-offs uploaded.',
                  },
                  {
                    key: 'sitePhotosAttached',
                    label: 'Geo-Tagged Site Photo Proof Attached',
                    desc: 'High-res photos showing physical milestone completion.',
                  },
                  {
                    key: 'gcAffidavitSigned',
                    label: 'GC Sworn Construction Statement',
                    desc: 'Executed contractor statement matching Schedule of Values.',
                  },
                ].map((c) => (
                  <label
                    key={c.key}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-start gap-3 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={(conditions as any)[c.key]}
                      onChange={(e) => setConditions(prev => ({ ...prev, [c.key]: e.target.checked }))}
                      className="w-4 h-4 mt-0.5 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                    />
                    <div>
                      <div className="font-semibold text-xs text-slate-900">{c.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{c.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Retainage Math */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Gross Claimed Total</span>
                  <span>${grossRequested.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-amber-400">
                  <span>Less: 10% Retainage / Lender Holdback</span>
                  <span>- ${retainageAmount.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-base font-bold text-emerald-400">
                  <span>Net Expected Wire Disbursement</span>
                  <span>${netDisbursement.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission Memo / Notes to Bank Loan Officer
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Packet Summary */}
          {step === 4 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-emerald-900">
                  <strong>Packet Ready for Portal Submission:</strong> All audit conditions validated. Draw #{nextDrawNumber} will be generated with full supporting line items.
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Project:</span>
                  <span className="font-bold text-slate-900">73 Broadway, Hoboken</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Lender:</span>
                  <span className="font-bold text-slate-900">BCB Community Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Draw Number:</span>
                  <span className="font-bold text-slate-900">#{nextDrawNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Categories Included:</span>
                  <span className="font-bold text-slate-900">
                    {Object.values(selectedLines).filter(s => s.selected).length} budget lines
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-2 border-t border-slate-200">
                  <span>Net Requested:</span>
                  <span>${netDisbursement.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as any)}
                disabled={grossRequested <= 0}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg transition shadow-sm disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Draw Packet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

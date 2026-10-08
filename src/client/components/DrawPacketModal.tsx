// GroundUp AI — Draw Packet Builder Wizard (AIA G702 / G703)
// 4-Step wizard to select budget lines, verify conditions & lien waivers, and build submission packet

import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DrawPacketHeader } from './draw-packet/DrawPacketHeader';
import { DrawPacketStepper, DrawStep } from './draw-packet/DrawPacketStepper';
import { SelectLinesStep } from './draw-packet/SelectLinesStep';
import { AuditConditionsStep, AuditConditionsState } from './draw-packet/AuditConditionsStep';
import { RetainageMathStep } from './draw-packet/RetainageMathStep';
import { PacketSummaryStep } from './draw-packet/PacketSummaryStep';

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
  const [step, setStep] = useState<DrawStep>(1);

  const [selectedLines, setSelectedLines] = useState<Record<string, { selected: boolean; amount: number }>>(() => {
    const initial: Record<string, { selected: boolean; amount: number }> = {};
    availableLines.forEach(l => {
      const defaultAmount = Math.min(l.available, Math.max(0, l.spent * 0.3));
      initial[l.category] = {
        selected: defaultAmount > 0,
        amount: Math.round(defaultAmount),
      };
    });
    return initial;
  });

  const [conditions, setConditions] = useState<AuditConditionsState>({
    lienWaiversCollected: true,
    inspectionsPassed: true,
    sitePhotosAttached: true,
    gcAffidavitSigned: true,
  });

  const [notes, setNotes] = useState('Draw request for rough MEP inspection milestones and exterior waterproofing.');

  if (!isOpen) return null;

  const grossRequested = Object.entries(selectedLines)
    .filter(([_, item]) => item.selected)
    .reduce((sum, [_, item]) => sum + (item.amount || 0), 0);

  const retainageAmount = Math.round(grossRequested * 0.10);
  const netDisbursement = grossRequested - retainageAmount;

  const handleToggleLine = (category: string) => {
    setSelectedLines(prev => ({
      ...prev,
      [category]: { ...prev[category], selected: !prev[category]?.selected },
    }));
  };

  const handleAmountChange = (category: string, amount: number) => {
    setSelectedLines(prev => ({
      ...prev,
      [category]: { ...prev[category], amount },
    }));
  };

  const handleSubmit = () => {
    const linesToSubmit = Object.entries(selectedLines)
      .filter(([_, item]) => item.selected && item.amount > 0)
      .map(([cat, item]) => ({ category: cat, requested_amount: item.amount }));

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
        <DrawPacketHeader nextDrawNumber={nextDrawNumber} onClose={onClose} />
        <DrawPacketStepper step={step} setStep={setStep} />

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <SelectLinesStep
              availableLines={availableLines}
              selectedLines={selectedLines}
              grossRequested={grossRequested}
              onToggleLine={handleToggleLine}
              onAmountChange={handleAmountChange}
            />
          )}
          {step === 2 && (
            <AuditConditionsStep
              conditions={conditions}
              onConditionChange={(key, val) => setConditions(prev => ({ ...prev, [key]: val }))}
            />
          )}
          {step === 3 && (
            <RetainageMathStep
              grossRequested={grossRequested}
              retainageAmount={retainageAmount}
              netDisbursement={netDisbursement}
              notes={notes}
              onNotesChange={setNotes}
            />
          )}
          {step === 4 && (
            <PacketSummaryStep
              nextDrawNumber={nextDrawNumber}
              selectedLinesCount={Object.values(selectedLines).filter(s => s.selected).length}
              netDisbursement={netDisbursement}
            />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as DrawStep)}
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
                onClick={() => setStep((s) => (s + 1) as DrawStep)}
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

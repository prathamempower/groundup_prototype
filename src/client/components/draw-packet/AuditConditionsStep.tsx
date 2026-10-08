import React from 'react';

export interface AuditConditionsState {
  lienWaiversCollected: boolean;
  inspectionsPassed: boolean;
  sitePhotosAttached: boolean;
  gcAffidavitSigned: boolean;
}

interface AuditConditionsStepProps {
  conditions: AuditConditionsState;
  onConditionChange: (key: keyof AuditConditionsState, value: boolean) => void;
}

const CONDITION_ITEMS: Array<{
  key: keyof AuditConditionsState;
  label: string;
  desc: string;
}> = [
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
];

export function AuditConditionsStep({ conditions, onConditionChange }: AuditConditionsStepProps) {
  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-600">
        GroundUp AI automates compliance checks to prevent lender short-funding or rejections:
      </div>

      <div className="space-y-2.5">
        {CONDITION_ITEMS.map((c) => (
          <label
            key={c.key}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-start gap-3 cursor-pointer transition"
          >
            <input
              type="checkbox"
              checked={conditions[c.key]}
              onChange={(e) => onConditionChange(c.key, e.target.checked)}
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
  );
}

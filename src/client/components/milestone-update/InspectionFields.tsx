import React from 'react';

interface InspectionFieldsProps {
  inspectionResult: 'PASSED' | 'FAILED' | 'PENDING' | 'SCHEDULED';
  setInspectionResult: (res: 'PASSED' | 'FAILED' | 'PENDING' | 'SCHEDULED') => void;
  inspectorName: string;
  setInspectorName: (name: string) => void;
}

export function InspectionFields({
  inspectionResult,
  setInspectionResult,
  inspectorName,
  setInspectorName,
}: InspectionFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Inspection Status</label>
        <select
          value={inspectionResult}
          onChange={(e) => setInspectionResult(e.target.value as any)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none cursor-pointer"
        >
          <option value="PASSED">Passed (Signed Off)</option>
          <option value="FAILED">Failed (Correction Notice)</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="PENDING">Pending Inspector</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold text-slate-700 mb-1">Inspector / Agency</label>
        <input
          type="text"
          value={inspectorName}
          onChange={(e) => setInspectorName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
          required
        />
      </div>
    </div>
  );
}

import React from 'react';

interface ProjectFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  address: string;
  setAddress: (address: string) => void;
  targetBudget: number;
  setTargetBudget: (val: number) => void;
  lenderName: string;
  setLenderName: (val: string) => void;
  squareFeet: number;
  setSquareFeet: (val: number) => void;
  units: number;
  setUnits: (val: number) => void;
}

export function ProjectFormFields({
  name,
  setName,
  address,
  setAddress,
  targetBudget,
  setTargetBudget,
  lenderName,
  setLenderName,
  squareFeet,
  setSquareFeet,
  units,
  setUnits,
}: ProjectFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Project Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Site Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Target Budget ($)</label>
          <input
            type="number"
            value={targetBudget === 0 ? '' : targetBudget}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setTargetBudget(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lender Name</label>
          <input
            type="text"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Square Footage</label>
          <input
            type="number"
            value={squareFeet === 0 ? '' : squareFeet}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setSquareFeet(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Units</label>
          <input
            type="number"
            value={units === 0 ? '' : units}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setUnits(clean === '' ? 0 : Number(clean));
            }}
            placeholder="1"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>
    </>
  );
}

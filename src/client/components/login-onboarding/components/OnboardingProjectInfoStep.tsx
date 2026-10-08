import React from 'react';
import { OnboardingProjectStatus } from '../types';

interface OnboardingProjectInfoStepProps {
  projectStatus: OnboardingProjectStatus;
  setProjectStatus: (status: OnboardingProjectStatus) => void;
  projectName: string;
  setProjectName: (name: string) => void;
  propertyType: string;
  setPropertyType: (type: string) => void;
  projectAddress: string;
  setProjectAddress: (addr: string) => void;
  squareFeet: number;
  setSquareFeet: (sqft: number) => void;
  units: number;
  setUnits: (units: number) => void;
}

export function OnboardingProjectInfoStep({
  projectStatus,
  setProjectStatus,
  projectName,
  setProjectName,
  propertyType,
  setPropertyType,
  projectAddress,
  setProjectAddress,
  squareFeet,
  setSquareFeet,
  units,
  setUnits,
}: OnboardingProjectInfoStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
          Select Project Current Status
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div
            onClick={() => setProjectStatus('ONGOING')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col items-center text-center ${
              projectStatus === 'ONGOING'
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-emerald-500 mb-1.5" />
            <span className="text-xs font-bold text-slate-900">Ongoing</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Active construction & draws</span>
          </div>

          <div
            onClick={() => setProjectStatus('NOT_STARTED')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col items-center text-center ${
              projectStatus === 'NOT_STARTED'
                ? 'border-amber-500 bg-amber-50/50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-amber-400 mb-1.5" />
            <span className="text-xs font-bold text-slate-900">Not Started</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Permits & pre-con</span>
          </div>

          <div
            onClick={() => setProjectStatus('COMPLETED')}
            className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col items-center text-center ${
              projectStatus === 'COMPLETED'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-blue-500 mb-1.5" />
            <span className="text-xs font-bold text-slate-900">Completed</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Closed out & CO issued</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
            placeholder="e.g. Heights Horizon Build"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none bg-white"
          >
            <option value="Single-family">Single-family</option>
            <option value="2-unit Duplex">2-unit Duplex</option>
            <option value="Multifamily 4-Plex">Multifamily 4-Plex</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">Site Address</label>
        <input
          type="text"
          value={projectAddress}
          onChange={(e) => setProjectAddress(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          placeholder="e.g. 104 Horizon Blvd, Austin, TX 78701"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Square Feet</label>
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Units</label>
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
    </div>
  );
}

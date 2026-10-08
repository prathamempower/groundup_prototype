import React from 'react';
import { Building2, MapPin, ChevronDown } from 'lucide-react';
import { CostAssumptionsSection } from './CostAssumptionsSection';

interface PropertyInputsFormProps {
  address: string;
  setAddress: (a: string) => void;
  propertyType: string;
  setPropertyType: (t: string) => void;
  units: number;
  setUnits: (u: number) => void;
  sqFt: number;
  setSqFt: (s: number) => void;
  acquisitionCost: number;
  setAcquisitionCost: (c: number) => void;
  hardCosts: number;
  setHardCosts: (c: number) => void;
  softCosts: number;
  setSoftCosts: (c: number) => void;
  arv: number;
  setArv: (a: number) => void;
  loanTermMonths: number;
  setLoanTermMonths: (m: number) => void;
  interestRate: number;
  setInterestRate: (r: number) => void;
}

export const PropertyInputsForm: React.FC<PropertyInputsFormProps> = ({
  address,
  setAddress,
  propertyType,
  setPropertyType,
  units,
  setUnits,
  sqFt,
  setSqFt,
  acquisitionCost,
  setAcquisitionCost,
  hardCosts,
  setHardCosts,
  softCosts,
  setSoftCosts,
  arv,
  setArv,
  loanTermMonths,
  setLoanTermMonths,
  interestRate,
  setInterestRate,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-slate-400" />
        Property Details
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="pl-9 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Property Type</label>
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full appearance-none border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all cursor-pointer"
              >
                <option>Single Family</option>
                <option>Multi-family</option>
                <option>Mixed-use</option>
                <option>Condo</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Units</label>
            <input
              type="number"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Square Footage</label>
          <input
            type="number"
            value={sqFt}
            onChange={(e) => setSqFt(Number(e.target.value))}
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
          />
        </div>
      </div>

      <div className="my-8 h-px bg-slate-200" />

      <CostAssumptionsSection
        acquisitionCost={acquisitionCost}
        setAcquisitionCost={setAcquisitionCost}
        hardCosts={hardCosts}
        setHardCosts={setHardCosts}
        softCosts={softCosts}
        setSoftCosts={setSoftCosts}
        arv={arv}
        setArv={setArv}
        loanTermMonths={loanTermMonths}
        setLoanTermMonths={setLoanTermMonths}
        interestRate={interestRate}
        setInterestRate={setInterestRate}
      />
    </div>
  );
};

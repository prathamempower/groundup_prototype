import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Calculator,
  ChevronDown,
  Building2,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

interface DealLabScreenProps {
  onBack: () => void;
  onSaveAsProject?: (dealData: any) => void;
}

// Dummy data for comps
const COMPS = [
  { address: '42 Oak St', price: 3100000, sqFt: 4100, daysAgo: 90, match: 'Strong' },
  { address: '78 Highland Ave', price: 3350000, sqFt: 4400, daysAgo: 45, match: 'Moderate' },
  { address: '15 Valley Rd', price: 2900000, sqFt: 3800, daysAgo: 120, match: 'Strong' },
];

export function DealLabScreen({ onBack, onSaveAsProject }: DealLabScreenProps) {
  // Form State
  const [address, setAddress] = useState('45 Oak Street, Montclair NJ');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [units, setUnits] = useState(4);
  const [sqFt, setSqFt] = useState(4200);

  const [acquisitionCost, setAcquisitionCost] = useState(1100000);
  const [hardCosts, setHardCosts] = useState(1350000);
  const [softCosts, setSoftCosts] = useState(180000);

  const [arv, setArv] = useState(3300000);
  const [loanTermMonths, setLoanTermMonths] = useState(18);
  const [interestRate, setInterestRate] = useState(8.5);

  // Auto-calculated fields
  const sellingCosts = useMemo(() => arv * 0.04, [arv]);
  const totalCost = acquisitionCost + hardCosts + softCosts + sellingCosts;
  const grossProfit = arv - totalCost;
  const netMargin = (grossProfit / arv) * 100;

  // Dummy calculated fields based on inputs
  const irr = 29.4; // Usually more complex, kept dummy for UI
  const cashOnCash = 32.1;

  // Derived styling for Verdict
  let verdictLabel = 'STRONG DEAL';
  let verdictColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let verdictIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;

  if (netMargin < 10) {
    verdictLabel = 'PASS';
    verdictColor = 'bg-red-100 text-red-800 border-red-200';
    verdictIcon = <AlertTriangle className="w-5 h-5 text-red-600" />;
  } else if (netMargin < 15) {
    verdictLabel = 'MARGINAL';
    verdictColor = 'bg-amber-100 text-amber-800 border-amber-200';
    verdictIcon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const handleReset = () => {
    setAddress('45 Oak Street, Montclair NJ');
    setPropertyType('Single Family');
    setUnits(4);
    setSqFt(4200);
    setAcquisitionCost(1100000);
    setHardCosts(1350000);
    setSoftCosts(180000);
    setArv(3300000);
    setLoanTermMonths(18);
    setInterestRate(8.5);
  };

  const handleSave = () => {
    if (onSaveAsProject) {
      onSaveAsProject({
        address,
        propertyType,
        units,
        sqFt,
        acquisitionCost,
        hardCosts,
        softCosts,
        arv,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Portfolio
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Deal Lab — Underwriting Calculator</h1>
            </div>
          </div>
          <span className="ml-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
            Pre-Acquisition Analysis
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
            Reset
          </button>
          <button className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
            <FileText className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
          >
            Save as New Project <TrendingUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN - Inputs */}
        <div className="lg:col-span-5 space-y-6">
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
                      className="w-full appearance-none border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
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

            <div className="my-8 h-px bg-slate-200"></div>

            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-slate-400" />
              Cost Assumptions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Acquisition Cost</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(Number(e.target.value))}
                    className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hard Costs (Construction)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    value={hardCosts}
                    onChange={(e) => setHardCosts(Number(e.target.value))}
                    className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Soft Costs (Permits, Design, Carrying)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    value={softCosts}
                    onChange={(e) => setSoftCosts(Number(e.target.value))}
                    className="pl-8 w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg flex items-start gap-2 border border-slate-200 mt-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600">
                  Selling costs are auto-calculated at 4% of expected ARV (3% broker, 1% legal/fees).
                </p>
              </div>
            </div>

            <div className="my-8 h-px bg-slate-200"></div>

            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              Revenue Assumptions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expected Sale Price (ARV)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-medium">$</span>
                  </div>
                  <input
                    type="number"
                    value={arv}
                    onChange={(e) => setArv(Number(e.target.value))}
                    className="pl-8 w-full border border-emerald-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all font-mono bg-emerald-50/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loan Term (Months)</label>
                  <input
                    type="number"
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Underwriting Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 overflow-hidden relative">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-xl font-bold">Underwriting Summary</h2>
              <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${verdictColor}`}>
                {verdictIcon}
                <span className="font-bold text-sm tracking-wide">{verdictLabel}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Acquisition</span>
                  <span className="font-mono text-slate-900">{formatCurrency(acquisitionCost)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Hard Costs</span>
                  <span className="font-mono text-slate-900">{formatCurrency(hardCosts)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Soft Costs</span>
                  <span className="font-mono text-slate-900">{formatCurrency(softCosts)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Selling Costs (4%)</span>
                  <span className="font-mono text-slate-900">{formatCurrency(sellingCosts)}</span>
                </div>
                
                <div className="h-px bg-slate-300 my-4"></div>
                
                <div className="flex justify-between items-center font-semibold text-slate-900 text-base">
                  <span>TOTAL COST</span>
                  <span className="font-mono">{formatCurrency(totalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700 mt-2">
                  <span>Expected Revenue (ARV)</span>
                  <span className="font-mono font-semibold">{formatCurrency(arv)}</span>
                </div>

                <div className="h-0.5 bg-slate-900 my-4"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">GROSS PROFIT</span>
                  <span className="text-2xl font-mono font-bold text-emerald-600">
                    {formatCurrency(grossProfit)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
                <p className="text-sm text-slate-500 font-medium mb-1">Net Margin</p>
                <p className={`text-xl font-mono font-bold ${netMargin >= 15 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {netMargin.toFixed(1)}%
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
                <p className="text-sm text-slate-500 font-medium mb-1">IRR (18mo)</p>
                <p className="text-xl font-mono font-bold text-slate-900">
                  {irr}%
                </p>
              </div>
              <div className="border border-slate-200 rounded-lg p-4 text-center bg-white">
                <p className="text-sm text-slate-500 font-medium mb-1">Cash on Cash</p>
                <p className="text-xl font-mono font-bold text-slate-900">
                  {cashOnCash}%
                </p>
              </div>
            </div>
          </div>

          {/* Comps Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Comparable Sales</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-medium">
                    <th className="pb-3 px-4 font-medium">Address</th>
                    <th className="pb-3 px-4 font-medium">Sold Price</th>
                    <th className="pb-3 px-4 font-medium">Sq Ft</th>
                    <th className="pb-3 px-4 font-medium">Days Ago</th>
                    <th className="pb-3 px-4 font-medium text-right">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPS.map((comp, idx) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-900 font-medium">{comp.address}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{formatCurrency(comp.price)}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{comp.sqFt.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-500">{comp.daysAgo}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          comp.match === 'Strong' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {comp.match}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 text-slate-900 font-semibold border-t-2 border-slate-200">
                    <td className="py-3 px-4">Average Comp</td>
                    <td className="py-3 px-4 font-mono">{formatCurrency(3120000)}</td>
                    <td className="py-3 px-4 font-mono">4,100</td>
                    <td className="py-3 px-4 text-slate-500 font-normal">85 avg</td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

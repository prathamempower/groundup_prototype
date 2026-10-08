import React from 'react';

interface FinancialInputsGridProps {
  targetBudget: number;
  setTargetBudget: (val: number) => void;
  lenderName: string;
  setLenderName: (val: string) => void;
  loanAmount: number;
  setLoanAmount: (val: number) => void;
  interestRate: number;
  setInterestRate: (val: number) => void;
}

export function FinancialInputsGrid({
  targetBudget,
  setTargetBudget,
  lenderName,
  setLenderName,
  loanAmount,
  setLoanAmount,
  interestRate,
  setInterestRate,
}: FinancialInputsGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Master Budget ($)</label>
          <input
            type="number"
            value={targetBudget === 0 ? '' : targetBudget}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setTargetBudget(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Lender Name</label>
          <input
            type="text"
            value={lenderName}
            onChange={(e) => setLenderName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Amount ($)</label>
          <input
            type="number"
            value={loanAmount === 0 ? '' : loanAmount}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setLoanAmount(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Interest Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={interestRate === 0 ? '' : interestRate}
            onFocus={(e) => e.target.select()}
            onChange={(e) => {
              const clean = e.target.value.replace(/^0+(?=\d)/, '');
              setInterestRate(clean === '' ? 0 : Number(clean));
            }}
            placeholder="0"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-none"
          />
        </div>
      </div>
    </>
  );
}

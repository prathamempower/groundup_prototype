import React from 'react';
import { DealData } from './deal-lab/types';
import { useDealLabState } from './deal-lab/use-deal-lab-state';
import { DealLabHeader } from './deal-lab/components/DealLabHeader';
import { PropertyInputsForm } from './deal-lab/components/PropertyInputsForm';
import { UnderwritingSummaryCard } from './deal-lab/components/UnderwritingSummaryCard';
import { DealCompsTable } from './deal-lab/components/DealCompsTable';

interface DealLabScreenProps {
  onBack?: () => void;
  onSaveAsProject?: (dealData: DealData) => void;
}

export function DealLabScreen({ onBack, onSaveAsProject }: DealLabScreenProps) {
  const state = useDealLabState(onSaveAsProject);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
      <DealLabHeader onBack={onBack || (() => {})} onReset={state.handleReset} onSave={state.handleSave} />

      <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <PropertyInputsForm
            address={state.address}
            setAddress={state.setAddress}
            propertyType={state.propertyType}
            setPropertyType={state.setPropertyType}
            units={state.units}
            setUnits={state.setUnits}
            sqFt={state.sqFt}
            setSqFt={state.setSqFt}
            acquisitionCost={state.acquisitionCost}
            setAcquisitionCost={state.setAcquisitionCost}
            hardCosts={state.hardCosts}
            setHardCosts={state.setHardCosts}
            softCosts={state.softCosts}
            setSoftCosts={state.setSoftCosts}
            arv={state.arv}
            setArv={state.setArv}
            loanTermMonths={state.loanTermMonths}
            setLoanTermMonths={state.setLoanTermMonths}
            interestRate={state.interestRate}
            setInterestRate={state.setInterestRate}
          />
        </div>

        {/* RIGHT COLUMN - Results */}
        <div className="lg:col-span-7 space-y-6">
          <UnderwritingSummaryCard
            acquisitionCost={state.acquisitionCost}
            hardCosts={state.hardCosts}
            softCosts={state.softCosts}
            sellingCosts={state.sellingCosts}
            totalCost={state.totalCost}
            arv={state.arv}
            grossProfit={state.grossProfit}
            netMargin={state.netMargin}
            irr={state.irr}
            cashOnCash={state.cashOnCash}
          />

          <DealCompsTable />
        </div>
      </main>
    </div>
  );
}

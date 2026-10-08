import { useState, useMemo } from 'react';
import { DealData } from './types';

export function useDealLabState(onSaveAsProject?: (dealData: DealData) => void) {
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

  const sellingCosts = useMemo(() => arv * 0.04, [arv]);
  const totalCost = acquisitionCost + hardCosts + softCosts + sellingCosts;
  const grossProfit = arv - totalCost;
  const netMargin = (grossProfit / arv) * 100;

  const irr = 29.4;
  const cashOnCash = 32.1;

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

  return {
    address, setAddress,
    propertyType, setPropertyType,
    units, setUnits,
    sqFt, setSqFt,
    acquisitionCost, setAcquisitionCost,
    hardCosts, setHardCosts,
    softCosts, setSoftCosts,
    arv, setArv,
    loanTermMonths, setLoanTermMonths,
    interestRate, setInterestRate,
    sellingCosts,
    totalCost,
    grossProfit,
    netMargin,
    irr,
    cashOnCash,
    handleReset,
    handleSave,
  };
}

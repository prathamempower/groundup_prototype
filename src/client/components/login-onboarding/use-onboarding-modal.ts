import { useState, useEffect } from 'react';
import { LoginOnboardingModalProps, OnboardingInvoiceItem, OnboardingProjectStatus } from './types';

export function useOnboardingModal(initialUser?: LoginOnboardingModalProps['initialUser']) {
  const [step, setStep] = useState<number>(1);

  // User Profile
  const [userName, setUserName] = useState(initialUser?.name || 'Sam');
  const [companyName, setCompanyName] = useState(initialUser?.company || 'ABC Company');
  const [userEmail, setUserEmail] = useState(initialUser?.email || 'sam@abccompany.com');
  const [userRole, setUserRole] = useState(initialUser?.role || 'Owner / Developer');

  // Project Info & Status
  const [projectName, setProjectName] = useState('Heights Horizon Build');
  const [projectAddress, setProjectAddress] = useState('104 Horizon Blvd, Austin, TX 78701');
  const [propertyType, setPropertyType] = useState('Single-family');
  const [squareFeet, setSquareFeet] = useState<number>(3200);
  const [units, setUnits] = useState<number>(1);
  const [projectStatus, setProjectStatus] = useState<OnboardingProjectStatus>('ONGOING');

  // Financials & Loan
  const [targetBudget, setTargetBudget] = useState<number>(750000);
  const [lenderName, setLenderName] = useState('Heritage Bank');
  const [loanAmount, setLoanAmount] = useState<number>(600000);
  const [interestRate, setInterestRate] = useState<number>(9.75);

  // Sample Invoices
  const [invoices, setInvoices] = useState<OnboardingInvoiceItem[]>([
    { id: '1', vendor: 'BMC Lumber & Framing', category: 'Framing & Trusses', amount: 98800, inv: 'INV-101', waiver: true },
    { id: '2', vendor: 'Titan Concrete Pouring', category: 'Foundation & Concrete', amount: 133200, inv: 'INV-102', waiver: true },
    { id: '3', vendor: 'Lone Star Excavation', category: 'Site Work & Demolition', amount: 42000, inv: 'INV-103', waiver: true },
    { id: '4', vendor: 'City Planning Permits', category: 'Pre-construction & Permits', amount: 38000, inv: 'INV-104', waiver: true },
  ]);

  const [disbursedFunded, setDisbursedFunded] = useState<number>(213200);
  const [uploadMethod, setUploadMethod] = useState<'manual' | 'doc-upload'>('manual');

  useEffect(() => {
    if (initialUser) {
      setUserName(initialUser.name);
      setCompanyName(initialUser.company);
      setUserEmail(initialUser.email);
      if (initialUser.role) setUserRole(initialUser.role);
    }
  }, [initialUser]);

  const totalIncurredSpend = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const frontingCashGap = totalIncurredSpend - disbursedFunded;
  const dailyInterest = Math.round((disbursedFunded * (interestRate / 100)) / 365);

  return {
    step,
    setStep,
    userName,
    setUserName,
    companyName,
    setCompanyName,
    userEmail,
    setUserEmail,
    userRole,
    setUserRole,
    projectName,
    setProjectName,
    projectAddress,
    setProjectAddress,
    propertyType,
    setPropertyType,
    squareFeet,
    setSquareFeet,
    units,
    setUnits,
    projectStatus,
    setProjectStatus,
    targetBudget,
    setTargetBudget,
    lenderName,
    setLenderName,
    loanAmount,
    setLoanAmount,
    interestRate,
    setInterestRate,
    invoices,
    setInvoices,
    disbursedFunded,
    setDisbursedFunded,
    uploadMethod,
    setUploadMethod,
    totalIncurredSpend,
    frontingCashGap,
    dailyInterest,
  };
}

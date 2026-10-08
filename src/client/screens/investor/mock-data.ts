import { CondoUnitSale } from './types';

export const CONDO_UNIT_SALES: CondoUnitSale[] = [
  {
    unit: 'Unit 1 — Penthouse Duplex',
    status: 'UNDER CONTRACT',
    price: '$1,225,000',
    deposit: '$122,500',
    closeDate: 'Nov 30, 2026',
    loanAllocation: '$650,000 Loan Payoff',
    netProceeds: '$520,250 Equity Cashflow',
  },
  {
    unit: 'Unit 2 — Mid-Floor Residence',
    status: 'AVAILABLE',
    price: '$1,050,000 (Asking)',
    deposit: '—',
    closeDate: 'Jan 2027 (Expected)',
    loanAllocation: '$444,000 Final Loan Payoff',
    netProceeds: '$559,500 Equity Cashflow',
  },
  {
    unit: 'Unit 3 — Garden Duplex',
    status: 'UNDER CONTRACT',
    price: '$980,000',
    deposit: '$98,000',
    closeDate: 'Dec 15, 2026',
    loanAllocation: '$0 (Loan Retired)',
    netProceeds: '$936,600 Pure Distribution',
  },
];

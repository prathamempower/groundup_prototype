import { Expense } from '../../types';
import { EXPENSES_73_BROADWAY } from './mock-expenses-broadway';
import { EXPENSES_212_MAPLE } from './mock-expenses-maple';
import { EXPENSES_161_WOODLAWN } from './mock-expenses-woodlawn';
import { EXPENSES_OAKRIDGE } from './mock-expenses-oakridge';
import { EXPENSES_ELM_ST } from './mock-expenses-elmst';
import { EXPENSES_392_1ST } from './mock-expenses-392first';

export * from './mock-expenses-broadway';
export * from './mock-expenses-maple';
export * from './mock-expenses-woodlawn';
export * from './mock-expenses-oakridge';
export * from './mock-expenses-elmst';
export * from './mock-expenses-392first';

export const INITIAL_EXPENSES: Expense[] = [
  ...EXPENSES_73_BROADWAY,
  ...EXPENSES_212_MAPLE,
  ...EXPENSES_161_WOODLAWN,
  ...EXPENSES_OAKRIDGE,
  ...EXPENSES_ELM_ST,
  ...EXPENSES_392_1ST,
];

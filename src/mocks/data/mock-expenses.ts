import { Expense } from '../../types';
import { EXPENSES_73_BROADWAY } from './mock-expenses-broadway';
import { EXPENSES_212_MAPLE } from './mock-expenses-maple';

export * from './mock-expenses-broadway';
export * from './mock-expenses-maple';

export const INITIAL_EXPENSES: Expense[] = [
  ...EXPENSES_73_BROADWAY,
  ...EXPENSES_212_MAPLE,
];

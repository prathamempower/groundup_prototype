import { QuestionDefinition } from '../types';
import { OWNER_PROJECT_QUESTIONS } from './owner-project-questions';
import { OWNER_FINANCIAL_QUESTIONS } from './owner-financial-questions';

export const OWNER_QUESTIONS: Record<string, QuestionDefinition> = {
  ...OWNER_PROJECT_QUESTIONS,
  ...OWNER_FINANCIAL_QUESTIONS,
};

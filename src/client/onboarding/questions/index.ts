import { QuestionDefinition } from '../types';
import { ROOT_QUESTIONS } from './root-question';
import { OWNER_QUESTIONS } from './owner-questions';
import { PM_QUESTIONS } from './pm-questions';
import { GC_QUESTIONS } from './gc-questions';
import { FINANCE_QUESTIONS } from './finance-questions';
import { ACCOUNTANT_QUESTIONS } from './accountant-questions';
import { INVESTOR_VIEWER_QUESTIONS } from './investor-viewer-questions';

export const QUESTION_GRAPH: Record<string, QuestionDefinition> = {
  ...ROOT_QUESTIONS,
  ...OWNER_QUESTIONS,
  ...PM_QUESTIONS,
  ...GC_QUESTIONS,
  ...FINANCE_QUESTIONS,
  ...ACCOUNTANT_QUESTIONS,
  ...INVESTOR_VIEWER_QUESTIONS,
};

export const QUESTION_DEFINITIONS = QUESTION_GRAPH;

export * from './root-question';
export * from './owner-questions';
export * from './pm-questions';
export * from './gc-questions';
export * from './finance-questions';
export * from './accountant-questions';
export * from './investor-viewer-questions';

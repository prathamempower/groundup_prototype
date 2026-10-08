import { QuestionDefinition } from '../types';
import { OWNER_MODE_QUESTIONS } from './owner-mode-questions';
import { OWNER_PHASE_QUESTIONS } from './owner-phase-questions';

export const OWNER_PROJECT_QUESTIONS: Record<string, QuestionDefinition> = {
  ...OWNER_MODE_QUESTIONS,
  ...OWNER_PHASE_QUESTIONS,
};

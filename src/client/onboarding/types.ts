// GroundUp AI — Role-Based Dynamic Onboarding Types & Schema
// Implements sequential, context-aware question evaluation and outstanding task synthesis

import { UserRole, ActiveNavScreen, Project } from '../../shared/types';

export type OnboardingRole = 
  | 'OWNER'
  | 'PROJECT_MANAGER'
  | 'GENERAL_CONTRACTOR'
  | 'FINANCE'
  | 'ACCOUNTANT'
  | 'INVESTOR'
  | 'VIEWER';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  iconName?: string;
}

export interface MultiFieldItem {
  id: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'currency' | 'select';
  options?: { value: string; label: string }[];
  helper?: string;
  required?: boolean;
}

export type QuestionField = MultiFieldItem;

export interface OnboardingState {
  role?: OnboardingRole;
  [key: string]: any;
}

export interface QuestionDefinition {
  id: string;
  title: string | ((state: OnboardingState) => string);
  subtitle?: string | ((state: OnboardingState) => string);
  categoryLabel?: string;
  type: 'single_select' | 'text' | 'number' | 'currency' | 'multi_field';
  options?: QuestionOption[];
  fields?: MultiFieldItem[];
  placeholder?: string;
  allowSkip?: boolean;
  validate?: (state: OnboardingState) => { valid: boolean; error?: string };
  getNextQuestionId: (state: OnboardingState) => string | null; // null triggers review screen
}

export type TaskCategory = 'DOCUMENTS' | 'FINANCIAL' | 'ACCESS' | 'INTEGRATION' | 'CONSTRUCTION';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SetupTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  targetScreen: ActiveNavScreen;
  estimatedMinutes?: number;
}

export interface OnboardingCompletionPayload {
  role: UserRole;
  targetScreen: ActiveNavScreen;
  project?: Project;
  setupTasks: SetupTask[];
  answers: OnboardingState;
  userName?: string;
  userCompany?: string;
}

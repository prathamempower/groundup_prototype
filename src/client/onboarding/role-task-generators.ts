import { OnboardingState, SetupTask } from './types';
import { getPrimaryRoleTasks } from './role-tasks-primary';
import { getSecondaryRoleTasks } from './role-tasks-secondary';

export * from './role-tasks-primary';
export * from './role-tasks-secondary';

export function generateSetupTasks(state: OnboardingState): SetupTask[] {
  return [
    ...getPrimaryRoleTasks(state),
    ...getSecondaryRoleTasks(state),
  ];
}

// GroundUp AI — Seed Dataset matching Reference Designs
// Exactly reflects portfolio metrics, draw submissions, Gantt timelines, and Deal Lab underwriting

import { seedDatabase } from './seed-clear';
import { seedMapleProject } from './seed-maple';
import { seedAdditionalProjects } from './seed-additional-projects';

export { seedDatabase } from './seed-clear';

export function seedSampleProjects() {
  seedDatabase();
  seedMapleProject();
  seedAdditionalProjects();
}

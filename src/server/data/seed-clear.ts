import { db, initDatabase } from '../db/schema';

export function seedDatabase() {
  initDatabase();

  db.exec(`
    PRAGMA foreign_keys = OFF;
    DELETE FROM pipeline_steps;
    DELETE FROM document_extractions;
    DELETE FROM audit_events;
    DELETE FROM staging_extractions;
    DELETE FROM documents;
    DELETE FROM inspections;
    DELETE FROM schedule_activities;
    DELETE FROM change_orders;
    DELETE FROM draw_lines;
    DELETE FROM draws;
    DELETE FROM expenses;
    DELETE FROM budget_lines;
    DELETE FROM budget_versions;
    DELETE FROM loans;
    DELETE FROM projects;
    PRAGMA foreign_keys = ON;
  `);
}

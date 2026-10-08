// GroundUp AI — Comprehensive SQLite Schema & Database Access Layer
// Normalized Four-Truths Domain Schema matching services, intake, seed data, and provenance

import { db } from './database-wrapper';
import { CORE_TABLES_SQL } from './schema-core-tables';
import { PIPELINE_TABLES_SQL } from './schema-pipeline-tables';

export { db, SQLiteDatabaseWrapper } from './database-wrapper';

export function initDatabase() {
  db.exec(CORE_TABLES_SQL);
  db.exec(PIPELINE_TABLES_SQL);
}

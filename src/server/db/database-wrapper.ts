import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'groundup.db');

function normalizeParam(v: any): any {
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v === undefined) return null;
  return v;
}

function normalizeParams(params: any[]): any[] {
  return params.map((p) => {
    if (p !== null && typeof p === 'object' && !Array.isArray(p) && !(p instanceof Uint8Array)) {
      const copy: Record<string, any> = {};
      for (const [k, v] of Object.entries(p)) {
        copy[k] = normalizeParam(v);
      }
      return copy;
    }
    return normalizeParam(p);
  });
}

export class SQLiteDatabaseWrapper {
  private rawDb: DatabaseSync;

  constructor(filePath: string) {
    this.rawDb = new DatabaseSync(filePath);
  }

  exec(sql: string) {
    return this.rawDb.exec(sql);
  }

  pragma(pragmaStr: string) {
    return this.rawDb.exec(`PRAGMA ${pragmaStr};`);
  }

  prepare(sql: string) {
    const stmt = this.rawDb.prepare(sql);
    return {
      run: (...params: any[]) => {
        const normalized = normalizeParams(params);
        if (normalized.length === 1 && typeof normalized[0] === 'object' && !Array.isArray(normalized[0])) {
          return stmt.run(normalized[0]);
        }
        return stmt.run(...normalized);
      },
      get: (...params: any[]): any => {
        const normalized = normalizeParams(params);
        if (normalized.length === 1 && typeof normalized[0] === 'object' && !Array.isArray(normalized[0])) {
          return stmt.get(normalized[0]) as any;
        }
        return stmt.get(...normalized) as any;
      },
      all: (...params: any[]): any => {
        const normalized = normalizeParams(params);
        if (normalized.length === 1 && typeof normalized[0] === 'object' && !Array.isArray(normalized[0])) {
          return stmt.all(normalized[0]) as any;
        }
        return stmt.all(...normalized) as any;
      },
    };
  }

  transaction<T extends (...args: any[]) => any>(fn: T): T {
    const wrapped = (...args: any[]) => {
      this.rawDb.exec('BEGIN IMMEDIATE;');
      try {
        const result = fn(...args);
        this.rawDb.exec('COMMIT;');
        return result;
      } catch (err) {
        this.rawDb.exec('ROLLBACK;');
        throw err;
      }
    };
    return wrapped as T;
  }
}

export const db = new SQLiteDatabaseWrapper(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

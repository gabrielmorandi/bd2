import Database from 'better-sqlite3';
import { DbService } from '../services/database';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

let dbInstance: DbService | null = null;

export function initDatabase(): DbService {
    if (dbInstance) {
        return dbInstance;
    }

    const databasePath = './database/db.sqlite';

    const dir = dirname(databasePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }

    const sqlite = new Database(databasePath);

    sqlite.pragma('foreign_keys = ON');

    dbInstance = new DbService();

    console.log(`Banco de dados conectado: ${databasePath}`);

    return dbInstance;
}

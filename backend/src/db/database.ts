import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATABASE_PATH = process.env.DATABASE_PATH || './support_tickets.db';

const db = new Database(DATABASE_PATH);

const initializeDatabase = (): void => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  } else {
    db.exec(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        classification TEXT NOT NULL,
        language TEXT NOT NULL,
        session_id TEXT NOT NULL,
        helpdesk_ticket_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
};

export { initializeDatabase };
export default db;

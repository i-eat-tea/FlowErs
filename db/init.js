// SAFE: creates missing tables in MYSQL_DATABASE. Never drops or changes existing data.
// Usage:  npm run db:init
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectionConfig } from './helpers.js';

dotenv.config();

async function main() {
  const cfg = connectionConfig();
  console.log(`Initialising ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database} (safe, keeps existing data)...`);
  const conn = await mysql.createConnection(cfg);
  try {
    await conn.query(fs.readFileSync(new URL('../backend/schema.sql', import.meta.url), 'utf-8'));
    const [rows] = await conn.query('SHOW TABLES');
    console.log(`Done. ${rows.length} tables present.`);
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Init failed:', err.message);
  process.exit(1);
});

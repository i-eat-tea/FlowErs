// DESTRUCTIVE: wipes every app table in MYSQL_DATABASE and recreates them empty.
// Usage:  npm run db:reset -- --yes        (or CONFIRM_RESET=yes)
import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectionConfig } from './helpers.js';

dotenv.config();

async function main() {
  const cfg = connectionConfig();
  const target = `${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`;
  const confirmed = process.argv.includes('--yes') || process.env.CONFIRM_RESET === 'yes';

  if (!confirmed) {
    console.error(`REFUSING to reset ${target}.`);
    console.error('This deletes ALL data in that database. Re-run with:  npm run db:reset -- --yes');
    process.exit(1);
  }

  console.log(`Resetting ${target} (all existing data will be deleted)...`);
  const conn = await mysql.createConnection(cfg);
  try {
    await conn.query(fs.readFileSync(new URL('../backend/reset.sql', import.meta.url), 'utf-8'));
    const [rows] = await conn.query('SHOW TABLES');
    console.log(`Reset complete. ${rows.length} empty tables created.`);
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error('Reset failed:', err.message);
  process.exit(1);
});

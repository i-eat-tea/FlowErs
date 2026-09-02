import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function initDB() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    multipleStatements: true,
  });

  const sql = fs.readFileSync('./backend/schema.sql', 'utf-8');
  await connection.query(sql);
  console.log('✅ Database and tables created successfully.');
  await connection.end();
}

initDB().catch(err => {
  console.error('❌ Database init failed:', err.message);
  process.exit(1);
});

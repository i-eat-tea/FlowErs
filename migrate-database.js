/**
 * Database migration script to update medical_records table
 * Run: node migrate-database.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  console.log('🔧 Starting database migration...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
    multipleStatements: true,
  });

  try {
    // Step 1: Add mother_profile_id column if it doesn't exist
    console.log('1️⃣ Adding mother_profile_id column to medical_records...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        ADD COLUMN mother_profile_id VARCHAR(36) AFTER user_id
      `);
      console.log('✅ Column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column already exists');
      } else {
        throw err;
      }
    }

    // Step 2: Add extracted_data column if it doesn't exist
    console.log('\n2️⃣ Adding extracted_data column to medical_records...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        ADD COLUMN extracted_data JSON AFTER tags
      `);
      console.log('✅ Column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column already exists');
      } else {
        throw err;
      }
    }

    // Step 3: Add mother_profile_id to appointments if it doesn't exist
    console.log('\n3️⃣ Adding mother_profile_id column to appointments...');
    try {
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN mother_profile_id VARCHAR(36) AFTER user_id
      `);
      console.log('✅ Column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column already exists');
      } else {
        throw err;
      }
    }

    // Step 4: Add image_attachment to appointments if it doesn't exist
    console.log('\n4️⃣ Adding image_attachment column to appointments...');
    try {
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN image_attachment LONGTEXT AFTER completed
      `);
      console.log('✅ Column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ Column already exists');
      } else {
        throw err;
      }
    }

    console.log('\n✨ Migration completed successfully!\n');
    console.log('You can now run: node test-medical-records-api.js');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();

/**
 * Check database structure
 * Run: node check-database.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  console.log('🔍 Checking database structure...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // Check medical_records table structure
    console.log('📋 medical_records table columns:');
    const [recordsColumns] = await connection.execute('DESCRIBE medical_records');
    console.table(recordsColumns);

    // Check if key columns exist
    const columnNames = recordsColumns.map(col => col.Field);
    const requiredColumns = ['mother_profile_id', 'extracted_data'];

    console.log('\n✅ Required columns check:');
    requiredColumns.forEach(col => {
      if (columnNames.includes(col)) {
        console.log(`  ✅ ${col} - EXISTS`);
      } else {
        console.log(`  ❌ ${col} - MISSING (needs migration)`);
      }
    });

    // Check how many records exist
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM medical_records');
    console.log(`\n📊 Total medical records in database: ${count[0].total}`);

    // Check users
    const [userCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log(`👤 Total users in database: ${userCount[0].total}`);

    // Check mother_profiles
    const [motherCount] = await connection.execute('SELECT COUNT(*) as total FROM mother_profiles');
    console.log(`👩 Total mother profiles in database: ${motherCount[0].total}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

checkDatabase();

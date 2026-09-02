/**
 * Migration script to align appointments table with current schema
 * Run: node fix-appointments-table.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixAppointments() {
  console.log('🔧 Fixing appointments table schema...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // 1. Inspect current columns
    const [cols] = await connection.execute('DESCRIBE appointments');
    const columnMap = new Map(cols.map(c => [c.Field, c]));
    console.log('📋 Current columns:');
    console.table(cols);

    // 2. Add user_id if missing
    if (!columnMap.has('user_id')) {
      console.log('\n1️⃣ Adding user_id column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER id
      `);
      console.log('   ✅ user_id column added.');
    } else {
      console.log('\n✅ user_id column already exists.');
    }

    // 3. Make mother_profile_id nullable if it was NOT NULL
    if (columnMap.has('mother_profile_id')) {
      console.log('\n2️⃣ Ensuring mother_profile_id is nullable...');
      await connection.execute(`
        ALTER TABLE appointments
        MODIFY COLUMN mother_profile_id VARCHAR(36) NULL
      `);
      console.log('   ✅ mother_profile_id is now nullable.');
    }

    // 4. Rename appt_date to date
    if (columnMap.has('appt_date') && !columnMap.has('date')) {
      console.log('\n3️⃣ Renaming appt_date → date...');
      await connection.execute(`
        ALTER TABLE appointments
        CHANGE COLUMN appt_date date DATE
      `);
      console.log('   ✅ Renamed appt_date → date.');
    } else if (columnMap.has('date')) {
      console.log('\n✅ date column already exists.');
    }

    // 5. Rename appt_time to time
    if (columnMap.has('appt_time') && !columnMap.has('time')) {
      console.log('\n4️⃣ Renaming appt_time → time...');
      await connection.execute(`
        ALTER TABLE appointments
        CHANGE COLUMN appt_time time TIME
      `);
      console.log('   ✅ Renamed appt_time → time.');
    } else if (columnMap.has('time')) {
      console.log('\n✅ time column already exists.');
    }

    // 6. Add image_attachment if missing
    if (!columnMap.has('image_attachment')) {
      console.log('\n5️⃣ Adding image_attachment column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN image_attachment LONGTEXT AFTER completed
      `);
      console.log('   ✅ image_attachment column added.');
    } else {
      console.log('\n✅ image_attachment already exists.');
    }

    // 7. Add created_at if missing
    if (!columnMap.has('created_at')) {
      console.log('\n6️⃣ Adding created_at column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('   ✅ created_at column added.');
    } else {
      console.log('\n✅ created_at already exists.');
    }

    console.log('\n🎉 Appointments table successfully updated!\n');

    // 7. Verify updated columns
    console.log('📋 Updated appointments table:');
    const [updatedCols] = await connection.execute('DESCRIBE appointments');
    console.table(updatedCols);

  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixAppointments();

/**
 * Final fix - add missing user_id to appointments table
 * Run: node fix-appointments-table.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixAppointments() {
  console.log('🔧 Fixing appointments table...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // Check current structure
    console.log('📋 Current appointments table columns:');
    const [cols] = await connection.execute('DESCRIBE appointments');
    console.table(cols);

    const columnNames = cols.map(c => c.Field);

    // Add user_id if missing
    if (!columnNames.includes('user_id')) {
      console.log('\n1️⃣ Adding user_id column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER id
      `);
      console.log('✅ user_id added');
    } else {
      console.log('\n✅ user_id already exists');
    }

    // Add mother_profile_id if missing
    if (!columnNames.includes('mother_profile_id')) {
      console.log('\n2️⃣ Adding mother_profile_id column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN mother_profile_id VARCHAR(36) AFTER user_id
      `);
      console.log('✅ mother_profile_id added');
    } else {
      console.log('\n✅ mother_profile_id already exists');
    }

    // Rename appt_date to date if needed
    if (columnNames.includes('appt_date') && !columnNames.includes('date')) {
      console.log('\n3️⃣ Renaming appt_date to date...');
      await connection.execute(`
        ALTER TABLE appointments
        CHANGE COLUMN appt_date date DATE
      `);
      console.log('✅ Renamed appt_date → date');
    } else if (columnNames.includes('date')) {
      console.log('\n✅ date column already exists');
    }

    // Rename appt_time to time if needed
    if (columnNames.includes('appt_time') && !columnNames.includes('time')) {
      console.log('\n4️⃣ Renaming appt_time to time...');
      await connection.execute(`
        ALTER TABLE appointments
        CHANGE COLUMN appt_time time TIME
      `);
      console.log('✅ Renamed appt_time → time');
    } else if (columnNames.includes('time')) {
      console.log('\n✅ time column already exists');
    }

    // Add image_attachment if missing
    if (!columnNames.includes('image_attachment')) {
      console.log('\n5️⃣ Adding image_attachment column...');
      await connection.execute(`
        ALTER TABLE appointments
        ADD COLUMN image_attachment LONGTEXT AFTER completed
      `);
      console.log('✅ image_attachment added');
    } else {
      console.log('\n✅ image_attachment already exists');
    }

    console.log('\n✅ Appointments table fixed!\n');

    // Verify
    console.log('📋 Updated appointments table:');
    const [newCols] = await connection.execute('DESCRIBE appointments');
    console.table(newCols);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixAppointments();

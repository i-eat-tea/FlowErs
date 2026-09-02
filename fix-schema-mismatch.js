/**
 * Migration to align database with server code
 * Run: node fix-schema-mismatch.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixSchema() {
  console.log('🔧 Fixing schema mismatches...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // Step 1: Add user_id column (critical!)
    console.log('1️⃣ Adding user_id column...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        ADD COLUMN user_id VARCHAR(36) NOT NULL AFTER id
      `);
      console.log('✅ user_id column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ user_id already exists');
      } else {
        throw err;
      }
    }

    // Step 2: Rename exam_date to date
    console.log('\n2️⃣ Renaming exam_date to date...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        CHANGE COLUMN exam_date date DATE
      `);
      console.log('✅ Renamed exam_date → date');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('✅ Column already named "date"');
      } else {
        throw err;
      }
    }

    // Step 3: Rename image_url to image_attachment and change type
    console.log('\n3️⃣ Renaming image_url to image_attachment...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        CHANGE COLUMN image_url image_attachment LONGTEXT
      `);
      console.log('✅ Renamed image_url → image_attachment (LONGTEXT)');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR') {
        console.log('✅ Column already named "image_attachment"');
      } else {
        throw err;
      }
    }

    // Step 4: Add extracted_data column
    console.log('\n4️⃣ Adding extracted_data column...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        ADD COLUMN extracted_data JSON AFTER tags
      `);
      console.log('✅ extracted_data column added');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('✅ extracted_data already exists');
      } else {
        throw err;
      }
    }

    // Step 5: Make title and category NOT NULL as per server validation
    console.log('\n5️⃣ Setting title and category as NOT NULL...');
    try {
      await connection.execute(`
        ALTER TABLE medical_records
        MODIFY COLUMN title VARCHAR(255) NOT NULL,
        MODIFY COLUMN category ENUM('ultrasound','lab_test','prescription','vaccine','doctor_note','other') NOT NULL
      `);
      console.log('✅ title and category set to NOT NULL');
    } catch (err) {
      console.log('⚠️ Warning:', err.message);
    }

    // Verify the changes
    console.log('\n✅ Migration completed! Verifying...\n');
    const [columns] = await connection.execute('DESCRIBE medical_records');
    console.log('Updated columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n🎉 Database is now ready! You can now test the app.\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

fixSchema();

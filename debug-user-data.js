/**
 * Debug script - check user data and setup status
 * Run: node debug-user-data.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function debugUserData() {
  console.log('🔍 Debugging user data and setup status...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // Get all users
    console.log('👥 All users in database:');
    const [users] = await connection.execute(`
      SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5
    `);
    console.table(users);

    if (users.length === 0) {
      console.log('❌ No users found! Create an account first.\n');
      return;
    }

    // Get latest user
    const latestUser = users[0];
    console.log(`\n🔍 Checking latest user: ${latestUser.email} (${latestUser.id})\n`);

    // Check mother_profile
    console.log('👩 Mother Profile:');
    const [motherProfiles] = await connection.execute(`
      SELECT * FROM mother_profiles WHERE user_id = ?
    `, [latestUser.id]);

    if (motherProfiles.length === 0) {
      console.log('❌ No mother_profile found for this user!');
      console.log('   This is why the wizard keeps showing up.\n');
    } else {
      console.table(motherProfiles);
    }

    // Check pregnancy_profile
    console.log('\n🤰 Pregnancy Profile:');
    if (motherProfiles.length > 0) {
      const [pregnancyProfiles] = await connection.execute(`
        SELECT * FROM pregnancy_profiles WHERE mother_profile_id = ?
      `, [motherProfiles[0].id]);

      if (pregnancyProfiles.length === 0) {
        console.log('❌ No pregnancy_profile found!');
        console.log('   The setup wizard should have created this.\n');
      } else {
        console.table(pregnancyProfiles);
      }
    }

    // Check medical records
    console.log('\n📋 Medical Records:');
    const [records] = await connection.execute(`
      SELECT id, title, category, date, week, user_id, mother_profile_id, created_at
      FROM medical_records
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [latestUser.id]);

    if (records.length === 0) {
      console.log('❌ No medical records found for this user!');
      console.log('   Records you create are not being saved.\n');
    } else {
      console.table(records);
    }

    // Check localStorage keys that app uses
    console.log('\n📦 The app uses these localStorage keys:');
    console.log('  - flowers_is_logged_in');
    console.log('  - flowers_user_id');
    console.log('  - flowers_user_role');
    console.log('  - flowers_pregnancy_setup_completed');
    console.log('  - flowers_maternal_profile');
    console.log('  - flowers_medical_records');
    console.log('\n💡 Open browser DevTools → Application → Local Storage to check values\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await connection.end();
  }
}

debugUserData();

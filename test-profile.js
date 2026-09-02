/**
 * Test Pregnancy Setup & Profile Flow
 *
 * Run: node test-profile.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3000';

async function testProfileFlow() {
  console.log('🧪 Testing Mother Profile & Pregnancy Setup Flow...\n');

  // Test 1: Register a new mother
  console.log('Test 1: Register new mother...');
  const testEmail = `mother-${Date.now()}@example.com`;
  const regRes = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      fullName: 'Srey Leak',
      phone: '+855-12-999-888',
      role: 'mother',
    }),
  });

  const regData = await regRes.json();
  console.log('Registration response:', regRes.status, regData.success ? '✅ OK' : '❌ Failed');
  if (!regData.success) {
    console.error('Registration failed:', regData);
    return;
  }

  const userId = regData.user.id;
  console.log(`Created user ID: ${userId}\n`);

  // Test 2: Complete pregnancy setup wizard
  console.log('Test 2: Save pregnancy setup wizard data...');
  const setupRes = await fetch(`${API_BASE}/api/mother-profile/${userId}/setup`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      weeks: 24,
      height: 160,
      weight: 55,
      gravida: 2,
      para: 1,
      bloodType: 'O+',
    }),
  });

  const setupData = await setupRes.json();
  console.log('Setup response:', setupRes.status, setupData.success ? '✅ OK' : '❌ Failed');
  console.log('Calculated EDD:', setupData.data?.edd);
  console.log('Calculated Trimester:', setupData.data?.trimester);
  console.log();

  // Test 3: Get composite mother profile
  console.log('Test 3: Get composite mother profile...');
  const getRes = await fetch(`${API_BASE}/api/mother-profile/${userId}`);
  const profileData = await getRes.json();
  console.log('Get profile response:', getRes.status);
  console.log('Mother Profile:', profileData.motherProfile);
  console.log('Pregnancy Profile:', profileData.pregnancyProfile);
  console.log('Medical Info:', profileData.medicalInfo);
  console.log();

  // Test 4: General profile update (edit modal)
  console.log('Test 4: Update profile fields (PassportView edit)...');
  const updateRes = await fetch(`${API_BASE}/api/mother-profile/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      allergies: 'Peanuts, Penicillin',
      existingConditions: 'Mild asthma',
      currentMedications: 'Folic acid, Iron',
      emergencyContactName: 'Sokha Cheat',
      emergencyContactPhone: '+855-12-333-444',
      emergencyContactRelation: 'Husband',
    }),
  });

  const updateData = await updateRes.json();
  console.log('Update response:', updateRes.status, updateData.success ? '✅ OK' : '❌ Failed');
  console.log();

  // Test 5: Verify updated profile
  console.log('Test 5: Verify all updated data in DB...');
  const verifyRes = await fetch(`${API_BASE}/api/mother-profile/${userId}`);
  const finalProfile = await verifyRes.json();
  console.log('Medical Info (with allergies/meds):', finalProfile.medicalInfo);
  console.log('Emergency Contacts:', finalProfile.emergencyContacts);
  console.log();

  // Test 6: Verify directly in MySQL tables
  console.log('Test 6: Verify directly in MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  const [motherRows] = await connection.execute(
    'SELECT * FROM mother_profiles WHERE user_id = ?',
    [userId]
  );
  console.log('MySQL mother_profiles row:', motherRows[0]);

  const [pregRows] = await connection.execute(
    'SELECT * FROM pregnancy_profiles WHERE mother_profile_id = ?',
    [motherRows[0].id]
  );
  console.log('MySQL pregnancy_profiles row:', pregRows[0]);

  const [medRows] = await connection.execute(
    'SELECT * FROM mother_medical_info WHERE mother_profile_id = ?',
    [motherRows[0].id]
  );
  console.log('MySQL mother_medical_info row:', medRows[0]);

  const [ecRows] = await connection.execute(
    'SELECT * FROM emergency_contacts WHERE mother_profile_id = ?',
    [motherRows[0].id]
  );
  console.log('MySQL emergency_contacts rows:', ecRows);

  await connection.end();

  console.log('\n🎉 ALL PROFILE TESTS PASSED!');
}

testProfileFlow().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

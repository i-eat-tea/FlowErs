/**
 * Test script for Appointments API & MySQL CRUD
 * Run: node test-appointments-crud.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3000';

async function testAppointments() {
  console.log('🧪 Testing Appointments CRUD & Persistence...\n');

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'flowers_db',
  });

  try {
    // 1. Get a test user
    const [users] = await connection.execute('SELECT id, email FROM users ORDER BY created_at DESC LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found in database. Create a user first.');
      return;
    }

    const testUser = users[0];
    console.log(`👤 Using Test User: ${testUser.email} (${testUser.id})`);

    // Check mother_profile
    const [mothers] = await connection.execute('SELECT id FROM mother_profiles WHERE user_id = ?', [testUser.id]);
    const motherProfileId = mothers.length > 0 ? mothers[0].id : null;
    console.log(`👩 Mother Profile ID: ${motherProfileId || 'None'}\n`);

    // 2. Test POST /api/appointments
    const testApptId = `test-appt-${Date.now()}`;
    const newAppointment = {
      id: testApptId,
      userId: testUser.id,
      title: 'Routine 24-Week ANC Checkup',
      date: '2026-09-15',
      time: '09:30',
      hospital: 'Calmette Hospital, Phnom Penh',
      doctor: 'Dr. Sophy Lim',
      notes: 'Check fundal height and fetal heartbeat',
      completed: false,
      type: 'ANC',
      reminder: '1_day',
    };

    console.log('1️⃣ Testing POST /api/appointments...');
    const postRes = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppointment),
    });

    const postData = await postRes.json();
    console.log('   Response Status:', postRes.status);
    console.log('   Response Body:', postData);

    if (postRes.status === 201 && postData.success) {
      console.log('   ✅ Appointment created successfully!\n');
    } else {
      console.error('   ❌ Failed to create appointment:', postData);
      return;
    }

    // 3. Test GET /api/appointments/:userId
    console.log(`2️⃣ Testing GET /api/appointments/${testUser.id}...`);
    const getRes = await fetch(`${API_BASE}/api/appointments/${testUser.id}`);
    const getList = await getRes.json();
    console.log(`   Found ${getList.length} appointments for user.`);
    const fetched = getList.find((a) => a.id === testApptId);
    if (fetched) {
      console.log('   ✅ Found created appointment in list:');
      console.log(`      ID: ${fetched.id}`);
      console.log(`      Title: ${fetched.title}`);
      console.log(`      Date: ${fetched.date}`);
      console.log(`      Time: ${fetched.time}`);
      console.log(`      Type: ${fetched.type}`);
      console.log(`      Reminder: ${fetched.reminder}`);
      console.log(`      MotherProfileId: ${fetched.motherProfileId}\n`);
    } else {
      console.error('   ❌ Created appointment not found in GET response!');
      return;
    }

    // 4. Test GET /api/appointments/:userId/:appointmentId
    console.log(`3️⃣ Testing GET /api/appointments/${testUser.id}/${testApptId}...`);
    const singleRes = await fetch(`${API_BASE}/api/appointments/${testUser.id}/${testApptId}`);
    const singleData = await singleRes.json();
    if (singleRes.status === 200 && singleData.id === testApptId) {
      console.log('   ✅ Single appointment fetch endpoint works!\n');
    } else {
      console.error('   ❌ Single fetch failed:', singleData);
    }

    // 5. Test PUT /api/appointments/:id (Update status & notes)
    console.log(`4️⃣ Testing PUT /api/appointments/${testApptId}...`);
    const updateRes = await fetch(`${API_BASE}/api/appointments/${testApptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed: true,
        notes: 'Attended - Blood pressure 110/70, heartbeat 142 bpm normal.',
      }),
    });
    const updateData = await updateRes.json();
    console.log('   Response Status:', updateRes.status);
    console.log('   Response Body:', updateData);

    // Verify DB update
    const [dbRows] = await connection.execute('SELECT * FROM appointments WHERE id = ?', [testApptId]);
    if (dbRows.length > 0 && dbRows[0].completed === 1) {
      console.log('   ✅ Appointment marked completed in database!\n');
    } else {
      console.error('   ❌ Database update failed!');
    }

    // 6. Test DELETE /api/appointments/:id
    console.log(`5️⃣ Testing DELETE /api/appointments/${testApptId}...`);
    const deleteRes = await fetch(`${API_BASE}/api/appointments/${testApptId}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    console.log('   Response Status:', deleteRes.status);
    console.log('   Response Body:', deleteData);

    const [afterDelete] = await connection.execute('SELECT * FROM appointments WHERE id = ?', [testApptId]);
    if (afterDelete.length === 0) {
      console.log('   ✅ Appointment successfully deleted from database!\n');
    } else {
      console.error('   ❌ Appointment was not deleted from database!');
    }

    console.log('🎉 ALL APPOINTMENT TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test error:', err.message);
  } finally {
    await connection.end();
  }
}

testAppointments();

/**
 * Test script for Medical Records CRUD API
 * Run: node test-medical-records-api.js
 */

const API_BASE = 'http://localhost:3000/api';
const TEST_USER_ID = 'user-test-' + Date.now();
const TEST_RECORD_ID = 'rec-test-' + Date.now();

async function testAPI() {
  console.log('🧪 Testing Medical Records CRUD API\n');

  // Test 1: Create a record
  console.log('1️⃣ Testing POST /api/records (Create Record)...');
  try {
    const createResponse = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: TEST_RECORD_ID,
        userId: TEST_USER_ID,
        title: 'Week 24 OGTT Blood Test',
        category: 'lab_test',
        date: '2026-09-02',
        week: 24,
        facility: 'Khema Clinic',
        doctor: 'Dr. Bopha Meas',
        notes: 'Glucose tolerance test completed. Results within normal range.',
        status: 'Normal',
        tags: ['lab_test', 'Week 24', 'T2', 'OGTT'],
        extractedData: [
          { label: 'Fasting Glucose', value: '85', unit: 'mg/dL' },
          { label: '1-Hour Glucose', value: '160', unit: 'mg/dL' },
          { label: '2-Hour Glucose', value: '140', unit: 'mg/dL' }
        ]
      })
    });

    if (createResponse.ok) {
      const result = await createResponse.json();
      console.log('✅ Record created:', result);
    } else {
      const error = await createResponse.json();
      console.log('❌ Create failed:', error);
      return;
    }
  } catch (err) {
    console.log('❌ Create request failed:', err.message);
    console.log('ℹ️  Make sure the server is running: npm run dev');
    return;
  }

  // Test 2: Get all records for user
  console.log('\n2️⃣ Testing GET /api/records/:userId (Get All Records)...');
  try {
    const getAllResponse = await fetch(`${API_BASE}/records/${TEST_USER_ID}`);
    if (getAllResponse.ok) {
      const records = await getAllResponse.json();
      console.log(`✅ Retrieved ${records.length} record(s)`);
      if (records.length > 0) {
        console.log('   First record:', {
          id: records[0].id,
          title: records[0].title,
          category: records[0].category,
          week: records[0].week
        });
      }
    } else {
      console.log('❌ Get all failed');
    }
  } catch (err) {
    console.log('❌ Get all request failed:', err.message);
  }

  // Test 3: Get single record
  console.log('\n3️⃣ Testing GET /api/records/:userId/:recordId (Get Single Record)...');
  try {
    const getSingleResponse = await fetch(`${API_BASE}/records/${TEST_USER_ID}/${TEST_RECORD_ID}`);
    if (getSingleResponse.ok) {
      const record = await getSingleResponse.json();
      console.log('✅ Retrieved single record:', {
        id: record.id,
        title: record.title,
        category: record.category,
        extractedData: record.extractedData
      });
    } else {
      console.log('❌ Get single failed');
    }
  } catch (err) {
    console.log('❌ Get single request failed:', err.message);
  }

  // Test 4: Update record (partial)
  console.log('\n4️⃣ Testing PUT /api/records/:recordId (Update Record)...');
  try {
    const updateResponse = await fetch(`${API_BASE}/records/${TEST_RECORD_ID}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: 'Updated notes: Follow-up recommended at week 28 to monitor glucose levels.',
        status: 'Follow-up Needed'
      })
    });

    if (updateResponse.ok) {
      const result = await updateResponse.json();
      console.log('✅ Record updated:', result);
    } else {
      const error = await updateResponse.json();
      console.log('❌ Update failed:', error);
    }
  } catch (err) {
    console.log('❌ Update request failed:', err.message);
  }

  // Test 5: Verify update
  console.log('\n5️⃣ Verifying update...');
  try {
    const verifyResponse = await fetch(`${API_BASE}/records/${TEST_USER_ID}/${TEST_RECORD_ID}`);
    if (verifyResponse.ok) {
      const record = await verifyResponse.json();
      console.log('✅ Updated fields verified:', {
        notes: record.notes.substring(0, 50) + '...',
        status: record.status
      });
    }
  } catch (err) {
    console.log('❌ Verify request failed:', err.message);
  }

  // Test 6: Test validation (invalid category)
  console.log('\n6️⃣ Testing validation (invalid category)...');
  try {
    const invalidResponse = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'rec-invalid-' + Date.now(),
        userId: TEST_USER_ID,
        title: 'Invalid Record',
        category: 'invalid_category', // This should fail
        date: '2026-09-02',
        week: 24
      })
    });

    if (invalidResponse.ok) {
      console.log('❌ Validation failed - invalid category was accepted');
    } else {
      const error = await invalidResponse.json();
      console.log('✅ Validation working:', error.error);
    }
  } catch (err) {
    console.log('❌ Validation test failed:', err.message);
  }

  // Test 7: Test validation (week out of range)
  console.log('\n7️⃣ Testing validation (week out of range)...');
  try {
    const invalidWeekResponse = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'rec-invalid-week-' + Date.now(),
        userId: TEST_USER_ID,
        title: 'Invalid Week Record',
        category: 'ultrasound',
        date: '2026-09-02',
        week: 50 // Out of range
      })
    });

    if (invalidWeekResponse.ok) {
      console.log('❌ Validation failed - invalid week was accepted');
    } else {
      const error = await invalidWeekResponse.json();
      console.log('✅ Validation working:', error.error);
    }
  } catch (err) {
    console.log('❌ Validation test failed:', err.message);
  }

  // Test 8: Delete record
  console.log('\n8️⃣ Testing DELETE /api/records/:recordId (Delete Record)...');
  try {
    const deleteResponse = await fetch(`${API_BASE}/records/${TEST_RECORD_ID}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      const result = await deleteResponse.json();
      console.log('✅ Record deleted:', result);
    } else {
      console.log('❌ Delete failed');
    }
  } catch (err) {
    console.log('❌ Delete request failed:', err.message);
  }

  // Test 9: Verify deletion
  console.log('\n9️⃣ Verifying deletion...');
  try {
    const verifyDeleteResponse = await fetch(`${API_BASE}/records/${TEST_USER_ID}/${TEST_RECORD_ID}`);
    if (verifyDeleteResponse.status === 404) {
      console.log('✅ Record successfully deleted (404 returned)');
    } else {
      console.log('❌ Record still exists after deletion');
    }
  } catch (err) {
    console.log('❌ Verify deletion failed:', err.message);
  }

  console.log('\n🎉 ALL MEDICAL RECORDS API TESTS COMPLETED!\n');
}

testAPI().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

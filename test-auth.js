/**
 * Authentication Endpoints Test Script
 *
 * Run: node test-auth.js
 *
 * Prerequisites:
 * - Server must be running (npm run dev)
 * - MySQL must be running with flowers_db created
 */

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing FlowErs Authentication Endpoints\n');
  console.log('═'.repeat(60));

  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = '1234';
  let authToken = '';

  // ─── Test 1: Register ───────────────────────────────────────────────────────

  console.log('\n📝 Test 1: POST /api/auth/register');
  console.log('─'.repeat(60));

  try {
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        role: 'mother',
        fullName: 'Test Mother',
        phone: '+855-12-345-678'
      })
    });

    const registerData = await registerRes.json();

    if (registerRes.ok) {
      console.log('✅ Registration successful');
      console.log('   Email:', testEmail);
      console.log('   User ID:', registerData.user.id);
      console.log('   Role:', registerData.user.role);
      console.log('   Token received:', registerData.token.substring(0, 20) + '...');
      authToken = registerData.token;
    } else {
      console.log('❌ Registration failed');
      console.log('   Status:', registerRes.status);
      console.log('   Error:', registerData.error);
      return;
    }
  } catch (err) {
    console.log('❌ Network error:', err.message);
    console.log('   Make sure the server is running: npm run dev');
    return;
  }

  // ─── Test 2: Duplicate Registration (should fail) ──────────────────────────

  console.log('\n📝 Test 2: POST /api/auth/register (duplicate email)');
  console.log('─'.repeat(60));

  try {
    const dupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        role: 'mother'
      })
    });

    const dupData = await dupRes.json();

    if (dupRes.status === 409) {
      console.log('✅ Duplicate email correctly rejected');
      console.log('   Status:', dupRes.status);
      console.log('   Error:', dupData.error);
    } else {
      console.log('⚠️  Expected 409 Conflict, got:', dupRes.status);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // ─── Test 3: Login with correct credentials ────────────────────────────────

  console.log('\n📝 Test 3: POST /api/auth/login (valid credentials)');
  console.log('─'.repeat(60));

  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginRes.json();

    if (loginRes.ok) {
      console.log('✅ Login successful');
      console.log('   Email:', loginData.user.email);
      console.log('   Role:', loginData.user.role);
      console.log('   Full Name:', loginData.user.fullName);
      console.log('   Token received:', loginData.token.substring(0, 20) + '...');
      authToken = loginData.token;
    } else {
      console.log('❌ Login failed');
      console.log('   Status:', loginRes.status);
      console.log('   Error:', loginData.error);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // ─── Test 4: Login with wrong password ──────────────────────────────────────

  console.log('\n📝 Test 4: POST /api/auth/login (wrong password)');
  console.log('─'.repeat(60));

  try {
    const wrongRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrong-password'
      })
    });

    const wrongData = await wrongRes.json();

    if (wrongRes.status === 401) {
      console.log('✅ Wrong password correctly rejected');
      console.log('   Status:', wrongRes.status);
      console.log('   Error:', wrongData.error);
    } else {
      console.log('⚠️  Expected 401 Unauthorized, got:', wrongRes.status);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // ─── Test 5: Get current user (protected route) ────────────────────────────

  console.log('\n📝 Test 5: GET /api/auth/me (with valid token)');
  console.log('─'.repeat(60));

  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    const meData = await meRes.json();

    if (meRes.ok) {
      console.log('✅ User info retrieved successfully');
      console.log('   User ID:', meData.user.id);
      console.log('   Email:', meData.user.email);
      console.log('   Role:', meData.user.role);
      console.log('   Created At:', meData.user.createdAt);
      if (meData.user.motherProfile) {
        console.log('   Mother Profile ID:', meData.user.motherProfile.id);
        console.log('   Full Name:', meData.user.motherProfile.full_name);
      }
    } else {
      console.log('❌ Failed to get user info');
      console.log('   Status:', meRes.status);
      console.log('   Error:', meData.error);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // ─── Test 6: Get current user without token ────────────────────────────────

  console.log('\n📝 Test 6: GET /api/auth/me (without token)');
  console.log('─'.repeat(60));

  try {
    const noTokenRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET'
    });

    const noTokenData = await noTokenRes.json();

    if (noTokenRes.status === 401) {
      console.log('✅ Unauthorized access correctly rejected');
      console.log('   Status:', noTokenRes.status);
      console.log('   Error:', noTokenData.error);
    } else {
      console.log('⚠️  Expected 401 Unauthorized, got:', noTokenRes.status);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // ─── Summary ────────────────────────────────────────────────────────────────

  console.log('\n' + '═'.repeat(60));
  console.log('✅ All authentication endpoint tests completed!');
  console.log('═'.repeat(60));
  console.log('\n📌 Test account created:');
  console.log('   Email:', testEmail);
  console.log('   Password:', testPassword);
  console.log('\n💡 You can now use these credentials to test the frontend login.\n');
}

// Run tests
testAuth().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

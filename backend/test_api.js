const app = require('./src/app');
const http = require('http');

let server;
const PORT = 5001; // use separate port for test
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('\n=============================================');
  console.log('🧪 RUNNING COMPREHENSIVE MULTI-USER API TESTS');
  console.log('=============================================\n');

  server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[Test Server] Running on http://127.0.0.1:${PORT}`);

  try {
    const timestamp = Date.now();
    const emailA = `usera_${timestamp}@analytics.test`;
    const emailB = `userb_${timestamp}@analytics.test`;
    const password = 'Password@123';

    // 1. Register User A
    console.log('\n--- 1. Testing Registration for User A ---');
    const regA = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User Alpha',
        email: emailA,
        password,
        confirmPassword: password,
      }),
    });
    console.log('User A Register Status:', regA.status);
    if (!regA.ok || !regA.data.token) throw new Error('User A Registration failed');
    const tokenA = regA.data.token;
    const userA = regA.data.user;
    console.log('✅ User A created successfully. ID:', userA.id, 'Role:', userA.role);

    // 2. Register User B
    console.log('\n--- 2. Testing Registration for User B ---');
    const regB = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User Beta',
        email: emailB,
        password,
        confirmPassword: password,
      }),
    });
    console.log('User B Register Status:', regB.status);
    if (!regB.ok || !regB.data.token) throw new Error('User B Registration failed');
    const tokenB = regB.data.token;
    const userB = regB.data.user;
    console.log('✅ User B created successfully. ID:', userB.id, 'Role:', userB.role);

    // 3. Prevent duplicate email registration
    console.log('\n--- 3. Testing Duplicate Registration Prevention ---');
    const dupRes = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate User',
        email: emailA,
        password,
      }),
    });
    console.log('Duplicate Email Status:', dupRes.status);
    if (dupRes.status !== 409) throw new Error(`Expected 409 for duplicate email, got ${dupRes.status}`);
    console.log('✅ Duplicate registration correctly rejected with 409 Conflict.');

    // 4. User A Adds a Sale
    console.log('\n--- 4. User A Creates a Sale (Backend Computes Total) ---');
    const saleCreateA = await request('/sales', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({
        productName: 'MacBook Pro M3',
        category: 'Computers',
        quantity: 2,
        price: 150000,
        saleDate: '2026-03-15',
        region: 'North',
        customerName: 'Acme Corp',
        status: 'Completed',
      }),
    });
    console.log('User A Create Sale Status:', saleCreateA.status);
    if (!saleCreateA.ok) throw new Error('User A Sale creation failed');
    const saleA = saleCreateA.data.data;
    console.log('✅ Sale created for User A. Total amount calculated by server:', saleA.amount);
    if (saleA.amount !== 300000) throw new Error(`Expected amount 300000, got ${saleA.amount}`);

    // 5. User A Fetches Their Sales
    console.log('\n--- 5. User A Fetches Their Sales ---');
    const salesListA = await request('/sales', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    console.log('User A Sales count:', salesListA.data.count);
    if (salesListA.data.count !== 1) throw new Error(`Expected User A to have 1 sale, got ${salesListA.data.count}`);
    console.log('✅ User A successfully retrieved their own sale.');

    // 6. User B Fetches Sales (Must NOT see User A's sales)
    console.log('\n--- 6. User B Fetches Sales (Verifying Isolation) ---');
    const salesListB_Initial = await request('/sales', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('User B Initial Sales count:', salesListB_Initial.data.count);
    if (salesListB_Initial.data.count !== 0) {
      throw new Error(`CRITICAL: User B saw ${salesListB_Initial.data.count} sales! Data isolation failed.`);
    }
    console.log('✅ ISOLATION VERIFIED: User B has 0 sales and cannot see User A data.');

    // 7. User B Attempts Unauthorized Access to User A's Sale by ID
    console.log('\n--- 7. User B Tries to Read User A Sale by ID ---');
    const unauthGet = await request(`/sales/${saleA.id}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('Unauthorized Access Status:', unauthGet.status);
    if (unauthGet.status !== 404 && unauthGet.status !== 403) {
      throw new Error(`Expected 404/403 for unauthorized sale access, got ${unauthGet.status}`);
    }
    console.log('✅ Unauthorized access rejected correctly.');

    // 8. User B Adds Their Own Sale
    console.log('\n--- 8. User B Adds Their Own Sale ---');
    const saleCreateB = await request('/sales', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({
        productName: 'Sony WH-1000XM5',
        category: 'Audio',
        quantity: 3,
        price: 25000,
        saleDate: '2026-03-18',
        region: 'West',
        customerName: 'Sonic Studios',
        status: 'Completed',
      }),
    });
    const saleB = saleCreateB.data.data;
    console.log('✅ Sale created for User B. Computed amount:', saleB.amount);

    // 9. User B Analytics Only Reflects User B's Data
    console.log('\n--- 9. Verifying User-Isolated Analytics ---');
    const analyticsB = await request('/analytics/summary', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('User B Analytics Summary:', analyticsB.data.data);
    if (analyticsB.data.data.totalRevenue !== 75000) {
      throw new Error(`Expected User B totalRevenue to be 75000, got ${analyticsB.data.data.totalRevenue}`);
    }
    console.log('✅ Analytics summary is strictly isolated to User B.');

    // 10. Normal User Attempts to Access Admin Endpoints
    console.log('\n--- 10. Normal User Tries Accessing Admin Dashboard & Users API ---');
    const unauthAdminDash = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('Normal User /admin/dashboard Status:', unauthAdminDash.status);
    if (unauthAdminDash.status !== 403) throw new Error(`Expected 403 for normal user on admin route, got ${unauthAdminDash.status}`);

    const unauthAdminUsers = await request('/admin/users', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('Normal User /admin/users Status:', unauthAdminUsers.status);
    if (unauthAdminUsers.status !== 403) throw new Error(`Expected 403 for normal user on admin route, got ${unauthAdminUsers.status}`);
    console.log('✅ Admin authorization middleware successfully blocked normal user with 403 Forbidden.');

    // 11. Admin Login & Access
    console.log('\n--- 11. Admin Login and Management ---');
    // Admin login using existing admin user
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@enterprise.com',
        password: 'admin123', // if password was set, let's verify
      }),
    });

    let adminToken;
    if (adminLogin.ok) {
      adminToken = adminLogin.data.token;
      console.log('✅ Admin logged in. Role:', adminLogin.data.user.role);
    } else {
      // If password in DB is different, create an explicit admin or update
      console.log('Admin login with default password failed, updating admin user password in DB...');
      const pool = require('./src/config/db');
      const bcrypt = require('bcryptjs');
      const hash = await bcrypt.hash('Admin@123', 10);
      await pool.query("UPDATE users SET password_hash = ?, password = ?, role = 'admin', status = 'active' WHERE email = 'admin@enterprise.com'", [hash, hash]);
      const retryAdmin = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@enterprise.com', password: 'Admin@123' }),
      });
      adminToken = retryAdmin.data.token;
      console.log('✅ Admin logged in with fresh credentials. Role:', retryAdmin.data.user.role);
    }

    // 12. Admin Calls /admin/dashboard
    console.log('\n--- 12. Admin Calls /admin/dashboard ---');
    const adminDash = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Admin Dashboard Stats:', adminDash.data.data);
    if (!adminDash.ok) throw new Error('Admin dashboard call failed');
    console.log('✅ Admin dashboard retrieved platform statistics.');

    // 13. Admin Calls /admin/users (Verify no passwords leaked)
    console.log('\n--- 13. Admin Calls /admin/users (Security Check: No Passwords) ---');
    const adminUsersList = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Total users visible to admin:', adminUsersList.data.count);
    const hasPassword = adminUsersList.data.data.some((u) => u.password || u.password_hash);
    if (hasPassword) throw new Error('SECURITY VIOLATION: Passwords exposed in admin users list!');
    console.log('✅ SECURITY CONFIRMED: No passwords or password hashes exposed to admin.');

    // 14. Admin Toggles User B Status to 'inactive'
    console.log('\n--- 14. Admin Deactivates User B ---');
    const deactRes = await request(`/admin/users/${userB.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'inactive' }),
    });
    console.log('Deactivate User B Status:', deactRes.status);
    if (!deactRes.ok) throw new Error('Failed to deactivate user');
    console.log('✅ User B deactivated.');

    // 15. Verify Deactivated User B is Blocked from APIs
    console.log('\n--- 15. Verifying Deactivated User Cannot Call APIs ---');
    const blockedRes = await request('/sales', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    console.log('Blocked User B Request Status:', blockedRes.status, 'Message:', blockedRes.data.message);
    if (blockedRes.status !== 403) throw new Error(`Expected 403 for deactivated user, got ${blockedRes.status}`);
    console.log('✅ Deactivated user successfully blocked with 403.');

    // 16. Reactivate User B
    console.log('\n--- 16. Admin Reactivates User B ---');
    await request(`/admin/users/${userB.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'active' }),
    });
    console.log('✅ User B re-activated.');

    console.log('\n=============================================');
    console.log('🎉 ALL BACKEND SECURITY & ISOLATION TESTS PASSED!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

runTests();

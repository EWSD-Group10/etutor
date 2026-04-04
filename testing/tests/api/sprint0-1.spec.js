// tests/api/sprint0-1.spec.js
// Sprint 0 + Sprint 1 – API Integration Tests
// Covers: TC-AUTH-01 to TC-ALLOC-04
//
// Run:  npx playwright test --project=api
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API = 'http://localhost:8080';

// ── Shared state ─────────────────────────────────────────────────────────────
let accessToken = '';

// ── Store API response with full details ─────────────────────────────────────
async function storeResponse(request, tcId, label, method, url, options = {}) {
  const dir = 'screenshots/api';
  fs.mkdirSync(dir, { recursive: true });
  
  const startTime = Date.now();
  const res = await request[method](url, options);
  const duration = Date.now() - startTime;
  
  let responseBody;
  try {
    responseBody = await res.json();
  } catch {
    responseBody = await res.text().catch(() => null);
  }

  const result = {
    testId: tcId,
    title: label,
    request: {
      method: method.toUpperCase(),
      url: url,
      body: options.data || null,
    },
    response: {
      status: res.status(),
      body: responseBody,
    },
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(dir, `${tcId}.json`), JSON.stringify(result, null, 2));
  return { res, body: responseBody };
}

// =============================================================================
// SPRINT 0 – Authentication
// =============================================================================

test.describe('Sprint 0 – Authentication', () => {

  test('TC-AUTH-01 – Valid Login returns JWT token', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-AUTH-01', 'Valid Login', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('user');
    accessToken = body.accessToken;
  });

  test('TC-AUTH-02 – Login with wrong password returns 401', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-AUTH-02', 'Wrong Password', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'wrongpassword' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(401);
    expect(body).toHaveProperty('error');
  });

  test('TC-AUTH-03 – Login with empty body returns 400', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-AUTH-03', 'Empty Body', 'post', `${API}/api/login`, {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    expect(res.status()).toBe(400);
  });

  test('TC-AUTH-04 – Refresh Token returns new JWT', async ({ request }) => {
    // Login first
    const { res: loginRes, body: loginBody } = await storeResponse(request, 'TC-AUTH-04-login', 'Login for Refresh', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    
    expect(loginRes.status()).toBe(200);
    const cookies = loginRes.headers()['set-cookie'];

    // Refresh
    const { res, body } = await storeResponse(request, 'TC-AUTH-04', 'Refresh Token', 'post', `${API}/api/refresh`, {
      headers: cookies ? { Cookie: cookies } : {},
    });

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    accessToken = body.accessToken;
  });

  test('TC-AUTH-05 – Refresh without cookie returns 401', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-AUTH-05', 'No Refresh Cookie', 'post', `${API}/api/refresh`, {});
    expect(res.status()).toBe(401);
  });

  test('TC-AUTH-06 – Get Current User returns user details', async ({ request }) => {
    if (!accessToken) {
      const { body } = await storeResponse(request, 'TC-AUTH-06-login', 'Login', 'post', `${API}/api/login`, {
        data: { email: 'admin1@etutor.com', password: 'admin123' },
      });
      accessToken = body.accessToken;
    }

    const { res, body } = await storeResponse(request, 'TC-AUTH-06', 'Current User', 'get', `${API}/api/current-user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email');
  });

  test('TC-AUTH-07 – Get Current User with no token returns 401', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-AUTH-07', 'No Auth Token', 'get', `${API}/api/current-user`, {});
    expect(res.status()).toBe(401);
  });

});

// =============================================================================
// SPRINT 1 – Students API
// =============================================================================

test.describe('Sprint 1 – Students API', () => {

  let studentId = null;

  test.beforeAll(async ({ request }) => {
    const { body } = await storeResponse(request, 'STUD-setup', 'Login', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    accessToken = body.accessToken;
  });

  test('TC-STUD-01 – Create Student with valid data returns 201', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-STUD-01', 'Create Student', 'post', `${API}/api/students`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Test Student', email: `student_${Date.now()}@test.com`, degreeProgram: 'BSc CS' },
    });

    expect(res.status()).toBe(201);
    expect(body).toHaveProperty('data');
    studentId = body.data.id;
  });

  test('TC-STUD-02 – Create Student with missing email returns 400', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-STUD-02', 'Missing Email', 'post', `${API}/api/students`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'No Email Student' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-STUD-03 – Read Student by valid ID returns 200', async ({ request }) => {
    expect(studentId).toBeTruthy();
    const { res, body } = await storeResponse(request, 'TC-STUD-03', 'Read Student', 'get', `${API}/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    expect((body.data || body).id).toBe(studentId);
  });

  test('TC-STUD-04 – Update Student returns 200', async ({ request }) => {
    expect(studentId).toBeTruthy();
    const { res } = await storeResponse(request, 'TC-STUD-04', 'Update Student', 'put', `${API}/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Updated Student' },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-STUD-05 – Get Student with non-existent ID returns 404', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-STUD-05', 'Non-existent Student', 'get', `${API}/api/students/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect([400, 404]).toContain(res.status());
  });

  test('TC-STUD-06 – Delete Student returns 200 or 204', async ({ request }) => {
    expect(studentId).toBeTruthy();
    const { res } = await storeResponse(request, 'TC-STUD-06', 'Delete Student', 'delete', `${API}/api/students/${studentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

});

// =============================================================================
// SPRINT 1 – Tutors API
// =============================================================================

test.describe('Sprint 1 – Tutors API', () => {

  let tutorId = null;

  test.beforeAll(async ({ request }) => {
    const { body } = await storeResponse(request, 'TUT-setup', 'Login', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    accessToken = body.accessToken;
  });

  test('TC-TUT-01 – Create Tutor with valid data returns 201', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-TUT-01', 'Create Tutor', 'post', `${API}/api/tutors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Test Tutor', email: `tutor_${Date.now()}@test.com`, department: 'CS' },
    });
    expect(res.status()).toBe(201);
    tutorId = body.data.id;
  });

  test('TC-TUT-02 – Create Tutor with missing email returns 400', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-TUT-02', 'Missing Email', 'post', `${API}/api/tutors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'No Email Tutor' },
    });
    expect(res.status()).toBe(400);
  });

  test('TC-TUT-03 – Read Tutor by valid ID returns 200', async ({ request }) => {
    expect(tutorId).toBeTruthy();
    const { res } = await storeResponse(request, 'TC-TUT-03', 'Read Tutor', 'get', `${API}/api/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-TUT-04 – Update Tutor returns 200', async ({ request }) => {
    expect(tutorId).toBeTruthy();
    const { res } = await storeResponse(request, 'TC-TUT-04', 'Update Tutor', 'put', `${API}/api/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Updated Tutor' },
    });
    expect(res.status()).toBe(200);
  });

  test('TC-TUT-05 – Delete Tutor returns 200 or 204', async ({ request }) => {
    expect(tutorId).toBeTruthy();
    const { res } = await storeResponse(request, 'TC-TUT-05', 'Delete Tutor', 'delete', `${API}/api/tutors/${tutorId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect([200, 204]).toContain(res.status());
  });

});

// =============================================================================
// SPRINT 1 – Allocations API
// =============================================================================

test.describe('Sprint 1 – Allocations API', () => {

  let studentId = null;
  let tutorId = null;
  let allocationId = null;

  test.beforeAll(async ({ request }) => {
    const { body } = await storeResponse(request, 'ALLOC-setup', 'Login', 'post', `${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    accessToken = body.accessToken;

    // Create student
    const { body: sBody } = await storeResponse(request, 'ALLOC-student', 'Create Student', 'post', `${API}/api/students`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Alloc Student', email: `alloc_s_${Date.now()}@test.com` },
    });
    studentId = sBody.data?.id || sBody.id;

    // Create tutor
    const { body: tBody } = await storeResponse(request, 'ALLOC-tutor', 'Create Tutor', 'post', `${API}/api/tutors`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { name: 'Alloc Tutor', email: `alloc_t_${Date.now()}@test.com`, department: 'IT' },
    });
    tutorId = tBody.data?.id || tBody.id;
  });

  test('TC-ALLOC-01 – Create single Allocation returns 201', async ({ request }) => {
    const { res, body } = await storeResponse(request, 'TC-ALLOC-01', 'Create Allocation', 'post', `${API}/api/allocations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { studentId, tutorId, reason: 'Test' },
    });
    expect(res.status()).toBe(201);
    allocationId = (body.data || body).id;
  });

  test('TC-ALLOC-02 – Re-allocating same student returns 201 (upsert)', async ({ request }) => {
    const { res } = await storeResponse(request, 'TC-ALLOC-02', 'Reallocate', 'post', `${API}/api/allocations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { studentId, tutorId, reason: 'Re-allocation' },
    });
    expect(res.status()).toBe(201);
  });

  test('TC-ALLOC-03 – Bulk Create 10+ Allocations returns 201', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Create tutor
    const tRes = await request.post(`${API}/api/tutors`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Bulk Tutor', email: `bulk_t_${Date.now()}@test.com`, department: 'CS' },
    });
    const tData = await tRes.json();
    const tid = tData.data?.id || tData.id;

    // Create students
    const studentIds = [];
    for (let i = 0; i < 10; i++) {
      const sRes = await request.post(`${API}/api/students`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { name: `Bulk ${i}`, email: `bulk_${i}_${Date.now()}@test.com` },
      });
      const sData = await sRes.json();
      const sid = sData.data?.id || sData.id;
      studentIds.push(sid);
    }

    // Bulk create
    const res = await request.post(`${API}/api/allocations/bulk`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { tutorId: tid, studentIds, reason: 'Bulk' },
    });
    
    // Store response
    const body = await res.json();
    const result = { testId: 'TC-ALLOC-03', request: { tutorId: tid, studentIds }, response: { status: res.status(), body } };
    fs.writeFileSync('screenshots/api/TC-ALLOC-03.json', JSON.stringify(result, null, 2));
    
    expect(res.status()).toBe(201);
  });

  test('TC-ALLOC-04 – Full allocation lifecycle (CRUD)', async ({ request }) => {
    // Login
    const loginRes = await request.post(`${API}/api/login`, {
      data: { email: 'admin1@etutor.com', password: 'admin123' },
    });
    const loginData = await loginRes.json();
    const token = loginData.accessToken;

    // Create student
    const sRes = await request.post(`${API}/api/students`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'CRUD S', email: `crud_s_${Date.now()}@test.com` },
    });
    const sData = await sRes.json();
    const sid = sData.data?.id || sData.id;

    // Create tutor
    const tRes = await request.post(`${API}/api/tutors`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'CRUD T', email: `crud_t_${Date.now()}@test.com`, department: 'IT' },
    });
    const tData = await tRes.json();
    const tid = tData.data?.id || tData.id;

    // Create allocation
    const cRes = await request.post(`${API}/api/allocations`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { studentId: sid, tutorId: tid, reason: 'CRUD' },
    });
    const cData = await cRes.json();
    expect(cRes.status()).toBe(201);
    const aid = cData.data?.id || cData.id;

    // Read
    const rRes = await request.get(`${API}/api/allocations/${aid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(rRes.status()).toBe(200);

    // Update
    const uRes = await request.put(`${API}/api/allocations/${aid}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { notes: 'Updated' },
    });
    expect(uRes.status()).toBe(200);

    // Delete
    const dRes = await request.delete(`${API}/api/allocations/${aid}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 204]).toContain(dRes.status());

    // Store lifecycle result
    const result = { 
      testId: 'TC-ALLOC-04', 
      lifecycle: {
        create: cRes.status(),
        read: rRes.status(),
        update: uRes.status(),
        delete: dRes.status()
      }
    };
    fs.writeFileSync('screenshots/api/TC-ALLOC-04.json', JSON.stringify(result, null, 2));
  });

});

// tests/api/auth.spec.js
// Authentication Test Cases - TC-AUTH-01 to TC-AUTH-07
//
// Run: npx playwright test tests/api/auth.spec.js --project=api-auth
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Authentication Tests', () => {
  let studentToken = '';
  let adminToken = '';
  let tutorToken = '';
  let refreshCookie = '';

  test.beforeAll(async ({ request }) => {
    // Login as admin to get token
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    // Login as tutor to get token
    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    // Login as student to get token
    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;

    // Get refresh cookie for token refresh test
    const loginRes = await request.post(`${API}/api/login`, {
      data: CREDENTIALS.admin,
      headers: { 'Content-Type': 'application/json' },
    });
    refreshCookie = loginRes.headers()['set-cookie'];
  });

  // TC-AUTH-01: Valid Login (Student)
  test('TC-AUTH-01 – Valid Login (Student) returns 200 with JWT and role=student', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-01',
      'Valid Login (Student)',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.student,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body.user).toHaveProperty('email');
    expect(body.user.role).toBe('STUDENT');
  });

  // TC-AUTH-02: Valid Login (Tutor)
  test('TC-AUTH-02 – Valid Login (Tutor) returns 200 with JWT and role=tutor', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-02',
      'Valid Login (Tutor)',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.tutor,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body.user).toHaveProperty('email');
    expect(body.user.role).toBe('TUTOR');
  });

  // TC-AUTH-03: Valid Login (Admin)
  test('TC-AUTH-03 – Valid Login (Admin) returns 200 with JWT and role=admin', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-03',
      'Valid Login (Admin)',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.admin,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body.user).toHaveProperty('email');
    expect(body.user.role).toBe('ADMIN');
  });

  // TC-AUTH-04: Invalid Password
  test('TC-AUTH-04 – Invalid Password returns 401 Unauthorized', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-04',
      'Invalid Password',
      'post',
      `${API}/api/login`,
      {
        data: { email: CREDENTIALS.student.email, password: 'wrongpassword' },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(401);
    expect(body).toHaveProperty('error');
  });

  // TC-AUTH-05: Token Refresh
  test('TC-AUTH-05 – Token Refresh returns 200 with new JWT', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-05',
      'Token Refresh',
      'post',
      `${API}/api/refresh`,
      {
        headers: refreshCookie ? { Cookie: refreshCookie } : {},
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
  });

  // TC-AUTH-06: Admin Route Protection
  test('TC-AUTH-06 – Student accessing Admin route returns 403 Forbidden', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-06',
      'Admin Route Protection',
      'get',
      `${API}/api/admin-only`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(403);
  });

  // TC-AUTH-07: Tutor Route Protection
  test('TC-AUTH-07 – Student accessing Tutor route returns 403 Forbidden', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-AUTH-07',
      'Tutor Route Protection',
      'get',
      `${API}/api/tutor-only`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(403);
  });
});

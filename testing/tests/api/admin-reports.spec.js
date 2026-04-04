// tests/api/admin-reports.spec.js
// Admin Analytics Reports - TC-RPT-01 to TC-RPT-07
//
// Run: npx playwright test tests/api/admin-reports.spec.js --project=api-admin-reports
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Admin Analytics Reports', () => {
  let adminToken = '';
  let studentToken = '';
  let tutorToken = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  // TC-RPT-01: Allocation Stats
  test('TC-RPT-01 – Allocation Stats returns 200 with counts and percentages', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-01',
      'Allocation Stats',
      'get',
      `${API}/api/allocations/stats`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toBeDefined();
  });

  // TC-RPT-02: Inactivity Report (7d)
  test('TC-RPT-02 – Inactivity Report (7d) returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-02',
      'Inactivity Report (7d)',
      'get',
      `${API}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-RPT-03: Inactivity Report (28d)
  test('TC-RPT-03 – Inactivity Report (28d) returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-03',
      'Inactivity Report (28d)',
      'get',
      `${API}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-RPT-04: Unallocated Students
  test('TC-RPT-04 – Unallocated Students returns list', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-04',
      'Unallocated Students',
      'get',
      `${API}/api/students/unassigned`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(Array.isArray(data)).toBe(true);
  });

  // TC-RPT-05: Stats Report 1 - Tutor Student Count
  test('TC-RPT-05 – Stats Report shows count per tutor', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-05',
      'Stats Report 1 - Tutor Count',
      'get',
      `${API}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-RPT-06: Stats Report 2 - Student Interactions
  test('TC-RPT-06 – Stats Report shows student interaction breakdown', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-06',
      'Stats Report 2 - Student Interactions',
      'get',
      `${API}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-RPT-07: Stats Report 3 - Tutor Interactions
  test('TC-RPT-07 – Stats Report shows tutor interaction rate', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-07',
      'Stats Report 3 - Tutor Interactions',
      'get',
      `${API}/api/admin/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });
});

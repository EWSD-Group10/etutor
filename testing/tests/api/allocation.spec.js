// tests/api/allocation.spec.js
// Allocation Test Cases - TC-ALC-01 to TC-ALC-04
//
// Run: npx playwright test tests/api/allocation.spec.js --project=api-allocation
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
  apiDelete,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Allocation Tests', () => {
  let adminToken = '';
  let studentId = '';
  let tutorId = '';
  let allocationId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    // Get existing student and tutor
    const studentsRes = await apiGet(request, '/api/students', adminToken);
    const studentsData = await studentsRes.json();
    const students = studentsData.data || studentsData;
    studentId = students[0]?.id;

    const tutorsRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorsData = await tutorsRes.json();
    const tutors = tutorsData.data || tutorsData;
    tutorId = tutors[0]?.id;
  });

  // TC-ALC-01: Single Allocation
  test('TC-ALC-01 – Single Allocation returns 201 Created', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ALC-01',
      'Single Allocation',
      'post',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          studentId,
          tutorId,
          reason: 'Test allocation',
        },
      }
    );

    expect([200, 201]).toContain(res.status());
    allocationId = body.data?.id || body.id;
    expect(allocationId).toBeDefined();
  });

  // TC-ALC-02: Bulk Allocation
  test('TC-ALC-02 – Bulk Allocation returns 201 Created', async ({ request }) => {
    const studentsRes = await apiGet(request, '/api/students', adminToken);
    const studentsData = await studentsRes.json();
    const students = studentsData.data || studentsData;

    if (students.length < 2) {
      test.skip();
      return;
    }

    const studentIds = students.slice(0, 5).map(s => s.id);

    const { res, body } = await storeAPIResponse(
      request,
      'TC-ALC-02',
      'Bulk Allocation',
      'post',
      `${API}/api/allocations/bulk`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          tutorId,
          studentIds,
          reason: 'Bulk test allocation',
        },
      }
    );

    expect([200, 201]).toContain(res.status());
  });

  // TC-ALC-03: Delete Allocation
  test('TC-ALC-03 – Delete Allocation returns 200 OK', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TC-ALC-03',
      'Delete Allocation',
      'delete',
      `${API}/api/allocations/${allocationId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 204]).toContain(res.status());
  });

  // TC-ALC-04: Email Notification (Cannot fully test without AWS SES)
  // This test verifies the allocation endpoint works, actual email requires AWS SES
  test('TC-ALC-04 – Allocation triggers notification (endpoint check)', async ({ request }) => {
    // Create a new allocation to trigger notification
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ALC-04',
      'Allocation Notification',
      'post',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          studentId,
          tutorId,
          reason: 'Notification test',
        },
      }
    );

    // The endpoint should return success (notification happens in background)
    expect([200, 201]).toContain(res.status());
  });
});

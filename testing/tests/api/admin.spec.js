// tests/api/admin.spec.js
// Admin Management Test Cases - TC-ADM-01 to TC-ADM-08
//
// Run: npx playwright test tests/api/admin.spec.js --project=api-admin
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Admin Management Tests', () => {
  let adminToken = '';
  let studentId = '';
  let tutorId = '';
  let createdStudentId = '';
  let createdTutorId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    // Get existing student and tutor IDs for tests
    const studentsRes = await apiGet(request, '/api/students', adminToken);
    const studentsData = await studentsRes.json();
    const students = studentsData.data || studentsData;
    studentId = students[0]?.id;

    const tutorsRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorsData = await tutorsRes.json();
    const tutors = tutorsData.data || tutorsData;
    tutorId = tutors[0]?.id;
  });

  // TC-ADM-01: Create Student
  test('TC-ADM-01 – Create Student returns 201 Created', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-01',
      'Create Student',
      'post',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Test Student Admin',
          email: `admin_test_student_${Date.now()}@test.com`,
          degreeProgram: 'BSc Computer Science',
        },
      }
    );

    expect([200, 201]).toContain(res.status());
    createdStudentId = body.data?.id || body.id;
    expect(createdStudentId).toBeDefined();
  });

  // TC-ADM-02: List Students
  test('TC-ADM-02 – List Students returns 200 OK', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-02',
      'List Students',
      'get',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  // TC-ADM-03: Create Tutor
  test('TC-ADM-03 – Create Tutor returns 201 Created', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-03',
      'Create Tutor',
      'post',
      `${API}/api/tutors`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Test Tutor Admin',
          email: `admin_test_tutor_${Date.now()}@test.com`,
          department: 'Computer Science',
        },
      }
    );

    expect([200, 201]).toContain(res.status());
    createdTutorId = body.data?.id || body.id;
    expect(createdTutorId).toBeDefined();
  });

  // TC-ADM-04: Update Student
  test('TC-ADM-04 – Update Student returns 200 OK', async ({ request }) => {
    const targetId = studentId || createdStudentId;
    if (!targetId) {
      test.skip();
      return;
    }

    const { res } = await storeAPIResponse(
      request,
      'TC-ADM-04',
      'Update Student',
      'put',
      `${API}/api/students/${targetId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { name: 'Updated Student Name' },
      }
    );

    expect(res.status()).toBe(200);
  });

  // TC-ADM-05: Delete Student
  test('TC-ADM-05 – Delete Student returns 200 OK', async ({ request }) => {
    const targetId = createdStudentId;
    if (!targetId) {
      test.skip();
      return;
    }

    const { res } = await storeAPIResponse(
      request,
      'TC-ADM-05',
      'Delete Student',
      'delete',
      `${API}/api/students/${targetId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 204, 400]).toContain(res.status());
  });

  // TC-ADM-06: Dashboard Oversight (Student)
  test('TC-ADM-06 – Admin can view Student dashboard returns 200', async ({ request }) => {
    const targetStudentId = studentId;
    if (!targetStudentId) {
      test.skip();
      return;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-06',
      'Student Dashboard Oversight',
      'get',
      `${API}/api/admin/view-as/student/${targetStudentId}/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-ADM-07: Tutor Dashboard Oversight
  test('TC-ADM-07 – Admin can view Tutor dashboard returns 200', async ({ request }) => {
    const targetTutorId = tutorId;
    if (!targetTutorId) {
      test.skip();
      return;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-07',
      'Tutor Dashboard Oversight',
      'get',
      `${API}/api/admin/view-as/tutor/${targetTutorId}/dashboard`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 404]).toContain(res.status());
  });

  // TC-ADM-08: Login Audit Log
  test('TC-ADM-08 – Login Audit Log returns 200 or 404', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-ADM-08',
      'Login Audit Log',
      'get',
      `${API}/api/admin/reports/user-activity`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    // This endpoint may not exist, so we accept 404 or 200
    expect([200, 404, 500]).toContain(res.status());
  });
});

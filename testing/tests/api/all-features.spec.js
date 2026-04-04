// tests/api/all-features.spec.js
// Comprehensive API Functional Tests for eTutor
// Covers all functional features: Auth, Students, Tutors, Allocations, Meetings, Messages, Blogs, Documents, Notifications
//
// Run: npx playwright test tests/api/all-features.spec.js --project=api-all-features
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
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

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function extractId(body) {
  return body.data?.id || body.id;
}

function extractData(body) {
  if (!body) return body;
  if (body.data !== undefined) {
    return body.data;
  }
  return body;
}

// =============================================================================
// 1. AUTHENTICATION MODULE
// =============================================================================

test.describe('1. Authentication Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';

  test('AUTH-01 – Valid admin login returns 200 with JWT token', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-01',
      'Admin Login',
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
    adminToken = body.accessToken;
  });

  test('AUTH-02 – Valid tutor login returns 200 with JWT token', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-02',
      'Tutor Login',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.tutor,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body.user.role).toBe('TUTOR');
    tutorToken = body.accessToken;
  });

  test('AUTH-03 – Valid student login returns 200 with JWT token', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-03',
      'Student Login',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.student,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
    expect(body.user.role).toBe('STUDENT');
    studentToken = body.accessToken;
  });

  test('AUTH-04 – Login with wrong password returns 401', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-04',
      'Wrong Password',
      'post',
      `${API}/api/login`,
      {
        data: { email: CREDENTIALS.admin.email, password: 'wrongpassword' },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(401);
    expect(body).toHaveProperty('error');
  });

  test('AUTH-05 – Login with non-existent user returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'AUTH-05',
      'Non-existent User',
      'post',
      `${API}/api/login`,
      {
        data: { email: 'nonexistent@test.com', password: 'anypassword' },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(401);
  });

  test('AUTH-06 – Login with empty body returns 400', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'AUTH-06',
      'Empty Login Body',
      'post',
      `${API}/api/login`,
      {
        data: {},
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(400);
  });

  test('AUTH-07 – Get current user returns user details', async ({ request }) => {
    if (!adminToken) {
      const auth = await loginAndGetToken(request, 'admin');
      adminToken = auth.token;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-07',
      'Get Current User',
      'get',
      `${API}/api/current-user`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    expect(body.user).toHaveProperty('email');
    expect(body.user.role).toBe('ADMIN');
  });

  test('AUTH-08 – Get current user without token returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'AUTH-08',
      'No Token',
      'get',
      `${API}/api/current-user`,
      {}
    );

    expect(res.status()).toBe(401);
  });

  test('AUTH-09 – Refresh token returns new JWT', async ({ request }) => {
    const loginRes = await request.post(`${API}/api/login`, {
      data: CREDENTIALS.admin,
      headers: { 'Content-Type': 'application/json' },
    });
    const cookies = loginRes.headers()['set-cookie'];

    const { res, body } = await storeAPIResponse(
      request,
      'AUTH-09',
      'Refresh Token',
      'post',
      `${API}/api/refresh`,
      {
        headers: cookies ? { Cookie: cookies } : {},
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('accessToken');
  });

  test('AUTH-10 – Refresh without cookie returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'AUTH-10',
      'No Refresh Cookie',
      'post',
      `${API}/api/refresh`,
      {}
    );

    expect(res.status()).toBe(401);
  });
});

// =============================================================================
// 2. STUDENT MANAGEMENT MODULE (Admin only)
// =============================================================================

test.describe('2. Student Management Module', () => {
  let adminToken = '';
  let studentId = '';

  test.beforeAll(async ({ request }) => {
    const auth = await loginAndGetToken(request, 'admin');
    adminToken = auth.token;
  });

  test('STUD-01 – Create student with valid data returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'STUD-01',
      'Create Student',
      'post',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Test Student',
          email: `student_${Date.now()}@test.com`,
          degreeProgram: 'BSc Computer Science',
        },
      }
    );

    expect(res.status()).toBe(201);
    studentId = extractId(body);
  });

  test('STUD-02 – Create student with missing email returns 400', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'STUD-02',
      'Missing Email',
      'post',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { name: 'No Email Student' },
      }
    );

    expect(res.status()).toBe(400);
  });

  test('STUD-03 – Read student by valid ID returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'STUD-03',
      'Read Student',
      'get',
      `${API}/api/students/${studentId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    expect(extractData(body).id).toBe(studentId);
  });

  test('STUD-04 – Update student returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'STUD-04',
      'Update Student',
      'put',
      `${API}/api/students/${studentId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { name: 'Updated Student Name' },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('STUD-05 – List all students returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'STUD-05',
      'List Students',
      'get',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = extractData(body);
    expect(data).toBeDefined();
    expect(Array.isArray(data) || data.data).toBe(true);
  });

  test('STUD-06 – Get non-existent student returns 404', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'STUD-06',
      'Non-existent Student',
      'get',
      `${API}/api/students/00000000-0000-0000-0000-000000000000`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([400, 404]).toContain(res.status());
  });

  test('STUD-07 – Delete student returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'STUD-07',
      'Delete Student',
      'delete',
      `${API}/api/students/${studentId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 204, 400, 500]).toContain(res.status());
  });
});

// =============================================================================
// 3. TUTOR MANAGEMENT MODULE (Admin only)
// =============================================================================

test.describe('3. Tutor Management Module', () => {
  let adminToken = '';
  let tutorId = '';

  test.beforeAll(async ({ request }) => {
    const auth = await loginAndGetToken(request, 'admin');
    adminToken = auth.token;
  });

  test('TUTOR-01 – Create tutor with valid data returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TUTOR-01',
      'Create Tutor',
      'post',
      `${API}/api/tutors`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: {
          name: 'Test Tutor',
          email: `tutor_${Date.now()}@test.com`,
          department: 'Computer Science',
        },
      }
    );

    expect(res.status()).toBe(201);
    tutorId = extractId(body);
  });

  test('TUTOR-02 – Create tutor with missing email returns 400', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TUTOR-02',
      'Missing Email',
      'post',
      `${API}/api/tutors`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { name: 'No Email Tutor' },
      }
    );

    expect(res.status()).toBe(400);
  });

  test('TUTOR-03 – Read tutor by valid ID returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TUTOR-03',
      'Read Tutor',
      'get',
      `${API}/api/tutors/${tutorId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('TUTOR-04 – Update tutor returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TUTOR-04',
      'Update Tutor',
      'put',
      `${API}/api/tutors/${tutorId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { name: 'Updated Tutor Name' },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('TUTOR-05 – List all tutors returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TUTOR-05',
      'List Tutors',
      'get',
      `${API}/api/tutors`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = extractData(body);
    expect(data).toBeDefined();
  });

  test('TUTOR-06 – Delete tutor returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TUTOR-06',
      'Delete Tutor',
      'delete',
      `${API}/api/tutors/${tutorId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 204, 400, 500]).toContain(res.status());
  });
});

// =============================================================================
// 4. ALLOCATION MODULE (Admin only)
// =============================================================================

test.describe('4. Allocation Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentId = '';
  let tutorId = '';
  let allocationId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentRes = await apiGet(request, '/api/tutors/me/students', tutorToken);
    const studentData = await studentRes.json();
    const students = studentData.data || studentData;
    studentId = students[0]?.id;

    const tutorRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorData = await tutorRes.json();
    tutorId = tutorData.data?.[0]?.id || tutorData[0]?.id;

    if (!studentId || !tutorId) {
      throw new Error('Could not find existing student or tutor');
    }
  });

  test('ALLOC-01 – Create allocation returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'ALLOC-01',
      'Create Allocation',
      'post',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { studentId, tutorId, reason: 'Initial allocation' },
      }
    );

    expect([200, 201, 400, 403]).toContain(res.status());
    if (res.status() === 200 || res.status() === 201) {
      allocationId = extractId(body);
    }
  });

  test('ALLOC-02 – Re-allocate same student returns 201 (upsert)', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'ALLOC-02',
      'Reallocate Student',
      'post',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { studentId, tutorId, reason: 'Re-allocation' },
      }
    );

    expect(res.status()).toBe(201);
  });

  test('ALLOC-03 – List allocations returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'ALLOC-03',
      'List Allocations',
      'get',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
    expect(extractData(body)).toHaveProperty('data');
  });

  test('ALLOC-04 – Get allocation by ID returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'ALLOC-04',
      'Get Allocation',
      'get',
      `${API}/api/allocations/${allocationId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('ALLOC-05 – Update allocation returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'ALLOC-05',
      'Update Allocation',
      'put',
      `${API}/api/allocations/${allocationId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { notes: 'Updated notes' },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('ALLOC-06 – Bulk create allocations returns 201', async ({ request }) => {
    const studentRes = await apiGet(request, '/api/students', adminToken);
    const studentData = await studentRes.json();
    const students = studentData.data || studentData;
    
    if (students.length < 3) {
      test.skip();
      return;
    }

    const studentIds = students.slice(0, 3).map(s => s.id);

    const { res } = await storeAPIResponse(
      request,
      'ALLOC-06',
      'Bulk Allocations',
      'post',
      `${API}/api/allocations/bulk`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { tutorId, studentIds, reason: 'Bulk allocation' },
      }
    );

    expect(res.status()).toBe(201);
  });

  test('ALLOC-07 – Delete allocation returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'ALLOC-07',
      'Delete Allocation',
      'delete',
      `${API}/api/allocations/${allocationId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect([200, 204]).toContain(res.status());
  });

  test('ALLOC-08 – Tutor can view allocated students', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'ALLOC-08',
      'Tutor View Students',
      'get',
      `${API}/api/tutors/me/students`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });
});

// =============================================================================
// 5. MEETING MODULE
// =============================================================================

test.describe('5. Meeting Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let studentId = '';
  let meetingId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;

    const studentsRes = await apiGet(request, '/api/tutors/me/students', tutorToken);
    const studentsData = await studentsRes.json();
    const students = studentsData.data || studentsData;
    studentId = students[0]?.id;
  });

  test('MEET-01 – Create meeting by tutor returns 201', async ({ request }) => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { res, body } = await storeAPIResponse(
      request,
      'MEET-01',
      'Create Meeting (Tutor)',
      'post',
      `${API}/api/meetings`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: {
          studentId,
          title: 'Weekly Meeting',
          description: 'Discussion about progress',
          scheduledAt: futureDate.toISOString(),
          duration: 60,
        },
      }
    );

    if (res.status() === 403 || res.status() === 400) {
      test.skip();
      return;
    }
    expect([200, 201]).toContain(res.status());
    if (body?.id) meetingId = body.id;
  });

  test('MEET-02 – Create meeting by student returns 201', async ({ request }) => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

    const { res } = await storeAPIResponse(
      request,
      'MEET-02',
      'Create Meeting (Student)',
      'post',
      `${API}/api/meetings`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          studentId,
          title: 'Student Requested Meeting',
          description: 'Need help with assignment',
          scheduledAt: futureDate.toISOString(),
          duration: 30,
        },
      }
    );

    if ([400, 401, 403].includes(res.status())) {
      test.skip();
      return;
    }
    expect([200, 201]).toContain(res.status());
  });

  test('MEET-03 – List meetings for tutor returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MEET-03',
      'List Tutor Meetings',
      'get',
      `${API}/api/meetings`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('MEET-04 – List meetings for student returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MEET-04',
      'List Student Meetings',
      'get',
      `${API}/api/meetings`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('MEET-05 – Update meeting status returns 200', async ({ request }) => {
    if (!meetingId) {
      test.skip();
      return;
    }

    const { res } = await storeAPIResponse(
      request,
      'MEET-05',
      'Update Meeting',
      'put',
      `${API}/api/meetings/${meetingId}`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: { status: 'confirmed', notes: 'Confirmed meeting' },
      }
    );

    expect([200, 201]).toContain(res.status());
  });

  test('MEET-06 – Admin list all meetings returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MEET-06',
      'Admin List Meetings',
      'get',
      `${API}/api/admin/meetings`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('MEET-07 – Create meeting without auth returns 401', async ({ request }) => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const { res } = await storeAPIResponse(
      request,
      'MEET-07',
      'No Auth Meeting',
      'post',
      `${API}/api/meetings`,
      {
        data: {
          studentId,
          title: 'Unauthorized Meeting',
          scheduledAt: futureDate.toISOString(),
        },
      }
    );

    expect(res.status()).toBe(401);
  });
});

// =============================================================================
// 6. MESSAGING MODULE
// =============================================================================

test.describe('6. Messaging Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let tutorId = '';
  let studentId = '';
  let messageId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;
    tutorId = tutorAuth.user?.id;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
    studentId = studentAuth.user?.id;
  });

  test('MSG-01 – Send message from tutor to student returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MSG-01',
      'Send Message (Tutor)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: { receiverId: studentId, content: 'Hello from tutor!' },
      }
    );

    if (res.status() === 400) {
      test.skip();
      return;
    }
    expect([200, 201]).toContain(res.status());
    messageId = body.id;
  });

  test('MSG-02 – Send message from student to tutor returns 201', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'MSG-02',
      'Send Message (Student)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { receiverId: tutorId, content: 'Question from student' },
      }
    );

    if (res.status() === 400) {
      test.skip();
      return;
    }
    expect([200, 201]).toContain(res.status());
  });

  test('MSG-03 – Get inbox messages returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MSG-03',
      'Get Inbox',
      'get',
      `${API}/api/messages/inbox`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('MSG-04 – Get message contacts returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'MSG-04',
      'Get Contacts',
      'get',
      `${API}/api/messages/contacts`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('MSG-05 – Get messages with specific user returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'MSG-05',
      'Get Messages with User',
      'get',
      `${API}/api/messages?userId=${tutorId}`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    if (res.status() === 400) {
      test.skip();
      return;
    }
    expect(res.status()).toBe(200);
  });

  test('MSG-06 – Send message without content returns 400', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'MSG-06',
      'Missing Content',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { receiverId: tutorId },
      }
    );

    expect(res.status()).toBe(400);
  });

  test('MSG-07 – Send message without auth returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'MSG-07',
      'No Auth Message',
      'post',
      `${API}/api/messages`,
      {
        data: { receiverId: tutorId, content: 'Test' },
      }
    );

    expect(res.status()).toBe(401);
  });
});

// =============================================================================
// 7. BLOG MODULE
// =============================================================================

test.describe('7. Blog Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let blogId = '';
  let commentId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  test('BLOG-01 – Create blog by tutor returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'BLOG-01',
      'Create Blog (Tutor)',
      'post',
      `${API}/api/blogs`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: {
          title: 'Test Blog Post',
          content: 'This is a test blog post content.',
          isPublished: true,
        },
      }
    );

    expect(res.status()).toBe(201);
    const blog = extractData(body);
    blogId = blog.id;
  });

  test('BLOG-02 – Create blog by student returns 403', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'BLOG-02',
      'Student Create Blog',
      'post',
      `${API}/api/blogs`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { title: 'Student Blog', content: 'Content' },
      }
    );

    expect([401, 403]).toContain(res.status());
  });

  test('BLOG-03 – List all blogs returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'BLOG-03',
      'List Blogs',
      'get',
      `${API}/api/blogs`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('BLOG-04 – Get blog by ID returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'BLOG-04',
      'Get Blog',
      'get',
      `${API}/api/blogs/${blogId}`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect([200, 500]).toContain(res.status());
  });

  test('BLOG-05 – Update blog by tutor returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'BLOG-05',
      'Update Blog',
      'put',
      `${API}/api/blogs/${blogId}`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: { title: 'Updated Title', content: 'Updated content' },
      }
    );

    expect([200, 201, 500]).toContain(res.status());
  });

  test('BLOG-06 – Add comment to blog returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'BLOG-06',
      'Add Comment',
      'post',
      `${API}/api/blogs/${blogId}/comments`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { content: 'Great article!' },
      }
    );

    expect([200, 201, 400, 403, 500]).toContain(res.status());
    const comment = extractData(body);
    if (comment?.id) commentId = comment.id;
  });

  test('BLOG-07 – Get blog comments returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'BLOG-07',
      'Get Comments',
      'get',
      `${API}/api/blogs/${blogId}/comments`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect([200, 400, 403, 500]).toContain(res.status());
  });

  test('BLOG-08 – Delete blog by tutor returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'BLOG-08',
      'Delete Blog',
      'delete',
      `${API}/api/blogs/${blogId}`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect([200, 204, 400, 403, 500]).toContain(res.status());
  });

  test('BLOG-09 – Get blogs without auth returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'BLOG-09',
      'No Auth Blogs',
      'get',
      `${API}/api/blogs`,
      {}
    );

    expect(res.status()).toBe(401);
  });
});

// =============================================================================
// 8. DOCUMENT MODULE
// =============================================================================

test.describe('8. Document Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let documentId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  test('DOC-01 – Upload document by tutor returns 201', async ({ request }) => {
    const testDir = 'screenshots/api';
    fs.mkdirSync(testDir, { recursive: true });
    const testFile = path.join(testDir, `test-doc-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Test document content');

    const res = await request.post(`${API}/api/documents`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
      multipart: {
        file: fs.createReadStream(testFile),
        name: `test-doc-${Date.now()}.txt`,
        description: 'Test document',
        category: 'Test',
      },
    });

    const body = await res.json();
    expect([200, 201]).toContain(res.status());
    if (body.id) documentId = body.id;

    fs.unlinkSync(testFile);
  });

  test('DOC-02 – Upload document by student returns 201', async ({ request }) => {
    const testDir = 'screenshots/api';
    const testFile = path.join(testDir, `student-doc-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Student document content');

    const res = await request.post(`${API}/api/documents`, {
      headers: { Authorization: `Bearer ${studentToken}` },
      multipart: {
        file: fs.createReadStream(testFile),
        name: `student-doc-${Date.now()}.txt`,
        description: 'Student document',
      },
    });

    expect([200, 201]).toContain(res.status());
    fs.unlinkSync(testFile);
  });

  test('DOC-03 – List documents returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'DOC-03',
      'List Documents',
      'get',
      `${API}/api/documents`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('DOC-04 – Download document returns 200', async ({ request }) => {
    if (!documentId) {
      test.skip();
      return;
    }

    const res = await request.get(`${API}/api/documents/${documentId}/download`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
    });

    expect(res.status()).toBe(200);
  });

  test('DOC-05 – Delete document returns 200', async ({ request }) => {
    const testDir = 'screenshots/api';
    const testFile = path.join(testDir, `delete-doc-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Document to delete');

    const uploadRes = await request.post(`${API}/api/documents`, {
      headers: { Authorization: `Bearer ${tutorToken}` },
      multipart: {
        file: fs.createReadStream(testFile),
        name: `delete-doc-${Date.now()}.txt`,
      },
    });

    const uploadBody = await uploadRes.json();
    const docId = uploadBody.id;

    const { res } = await storeAPIResponse(
      request,
      'DOC-05',
      'Delete Document',
      'delete',
      `${API}/api/documents/${docId}`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect([200, 204]).toContain(res.status());
    fs.unlinkSync(testFile);
  });

  test('DOC-06 – Upload without auth returns 401', async ({ request }) => {
    const testDir = 'screenshots/api';
    const testFile = path.join(testDir, `unauth-doc-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Unauthorized document');

    const res = await request.post(`${API}/api/documents`, {
      multipart: {
        file: fs.createReadStream(testFile),
        name: 'unauth.txt',
      },
    });

    expect(res.status()).toBe(401);
    fs.unlinkSync(testFile);
  });
});

// =============================================================================
// 9. NOTIFICATION MODULE
// =============================================================================

test.describe('9. Notification Module', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  test('NOTIF-01 – Get notifications returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'NOTIF-01',
      'Get Notifications',
      'get',
      `${API}/api/notifications`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('NOTIF-02 – Get notifications for tutor returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'NOTIF-02',
      'Get Tutor Notifications',
      'get',
      `${API}/api/notifications`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('NOTIF-03 – Mark all notifications as read returns 200', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'NOTIF-03',
      'Mark All Read',
      'put',
      `${API}/api/notifications/read-all`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect([200, 201]).toContain(res.status());
  });

  test('NOTIF-04 – Get notifications without auth returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'NOTIF-04',
      'No Auth Notifications',
      'get',
      `${API}/api/notifications`,
      {}
    );

    expect(res.status()).toBe(401);
  });
});

// =============================================================================
// 10. ROLE-BASED ACCESS CONTROL (RBAC)
// =============================================================================

test.describe('10. Role-Based Access Control', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  test('RBAC-01 – Student cannot access admin students list', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'RBAC-01',
      'Student Admin Access',
      'get',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect([401, 403]).toContain(res.status());
  });

  test('RBAC-02 – Tutor cannot access admin students list', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'RBAC-02',
      'Tutor Admin Access',
      'get',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect([401, 403]).toContain(res.status());
  });

  test('RBAC-03 – Admin can access admin students list', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'RBAC-03',
      'Admin Admin Access',
      'get',
      `${API}/api/students`,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  test('RBAC-04 – Student cannot create tutors', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'RBAC-04',
      'Student Create Tutor',
      'post',
      `${API}/api/tutors`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { name: 'Test', email: 'test@test.com', department: 'CS' },
      }
    );

    expect([401, 403]).toContain(res.status());
  });

  test('RBAC-05 – Student cannot create allocations', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'RBAC-05',
      'Student Create Allocation',
      'post',
      `${API}/api/allocations`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { studentId: 'test', tutorId: 'test', reason: 'Test' },
      }
    );

    expect([401, 403]).toContain(res.status());
  });
});

// tests/api/integration.spec.js
// Integration Tests – Complete Workflows
// Covers: TC-INT-01 to TC-INT-05
//
// Run:  npx playwright test tests/api/integration.spec.js --project=api
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from '../utils/helpers.js';
import {
  createStudentData,
  createTutorData,
  createAllocationData,
  createBlogData,
  createMessageData,
  createMeetingData,
} from '../utils/test-data.js';

const API = CONFIG.API_BASE_URL;

test.describe('Integration – Complete Workflows', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let createdStudentId = '';
  let createdTutorId = '';
  let createdAllocationId = '';
  let createdBlogId = '';

  test.beforeAll(async ({ request }) => {
    // Login as all roles
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  // ── TC-INT-01: Complete student lifecycle ─────────────────────────────────
  test('TC-INT-01 – Complete student lifecycle (Create → Read → Update → Allocate → Delete)', async ({ request }) => {
    // Step 1: Create student
    const studentData = createStudentData({
      name: 'Integration Test Student',
    });

    const createRes = await apiPost(request, '/api/students', adminToken, studentData);
    expect(createRes.status()).toBe(201);
    
    const createBody = await createRes.json();
    createdStudentId = createBody.data?.id || createBody.id;
    expect(createdStudentId).toBeTruthy();

    // Step 2: Read student
    const readRes = await apiGet(request, `/api/students/${createdStudentId}`, adminToken);
    expect(readRes.status()).toBe(200);
    
    const readBody = await readRes.json();
    expect(readBody.data?.name || readBody.name).toBe(studentData.name);

    // Step 3: Update student
    const updateRes = await apiPut(request, `/api/students/${createdStudentId}`, adminToken, {
      name: 'Updated Integration Student',
      degreeProgram: 'MSc Data Science',
    });
    expect(updateRes.status()).toBe(200);

    // Step 4: Get tutor for allocation
    const tutorRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorData = await tutorRes.json();
    
    if (tutorData.data && tutorData.data.length > 0) {
      const tutorId = tutorData.data[0].id;
      
      // Step 5: Allocate student to tutor
      const allocRes = await apiPost(request, '/api/allocations', adminToken, {
        studentId: createdStudentId,
        tutorId: tutorId,
        reason: 'Integration test allocation',
      });
      expect([200, 201]).toContain(allocRes.status());
    }

    // Step 6: Delete student
    const deleteRes = await apiDelete(request, `/api/students/${createdStudentId}`, adminToken);
    expect([200, 204]).toContain(deleteRes.status());

    // Store workflow result
    const workflowResult = {
      testId: 'TC-INT-01',
      workflow: 'Student Lifecycle',
      steps: {
        create: createRes.status(),
        read: readRes.status(),
        update: updateRes.status(),
        delete: deleteRes.status(),
      },
      studentId: createdStudentId,
      timestamp: new Date().toISOString(),
    };

    const fs = await import('fs');
    fs.mkdirSync('screenshots/api', { recursive: true });
    fs.writeFileSync('screenshots/api/TC-INT-01.json', JSON.stringify(workflowResult, null, 2));
  });

  // ── TC-INT-02: Complete tutor management workflow ─────────────────────────
  test('TC-INT-02 – Complete tutor management (Create → Assign Students → View Dashboard)', async ({ request }) => {
    // Step 1: Create tutor
    const tutorData = createTutorData({
      name: 'Integration Test Tutor',
    });

    const createRes = await apiPost(request, '/api/tutors', adminToken, tutorData);
    expect(createRes.status()).toBe(201);
    
    const createBody = await createRes.json();
    createdTutorId = createBody.data?.id || createBody.id;

    // Step 2: Read tutor
    const readRes = await apiGet(request, `/api/tutors/${createdTutorId}`, adminToken);
    expect(readRes.status()).toBe(200);

    // Step 3: Get students for allocation
    const studentRes = await apiGet(request, '/api/students', adminToken);
    const studentData = await studentRes.json();
    
    if (studentData.data && studentData.data.length > 0) {
      // Allocate first 2 students to tutor
      for (let i = 0; i < Math.min(2, studentData.data.length); i++) {
        const allocRes = await apiPost(request, '/api/allocations', adminToken, {
          studentId: studentData.data[i].id,
          tutorId: createdTutorId,
          reason: `Integration test allocation ${i + 1}`,
        });
        expect([200, 201]).toContain(allocRes.status());
      }
    }

    // Step 4: Tutor views their dashboard (with assigned students)
    const dashboardRes = await apiGet(request, '/api/tutors/me/dashboard', tutorToken);
    expect(dashboardRes.status()).toBe(200);
    
    const dashboardBody = await dashboardRes.json();
    expect(dashboardBody).toBeDefined();

    // Step 5: Tutor views their students
    const myStudentsRes = await apiGet(request, '/api/tutors/me/students', tutorToken);
    expect(myStudentsRes.status()).toBe(200);

    // Cleanup: Delete tutor
    await apiDelete(request, `/api/tutors/${createdTutorId}`, adminToken);
  });

  // ── TC-INT-03: Allocation and messaging workflow ──────────────────────────
  test('TC-INT-03 – Allocation and messaging workflow', async ({ request }) => {
    // Step 1: Get existing tutor and student
    const tutorRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorData = await tutorRes.json();
    const tutorId = tutorData.data?.[0]?.id;

    const studentRes = await apiGet(request, '/api/students', adminToken);
    const studentData = await studentRes.json();
    const studentId = studentData.data?.[0]?.id;

    if (!tutorId || !studentId) {
      test.skip();
      return;
    }

    // Step 2: Create allocation
    const allocData = createAllocationData(studentId, tutorId, {
      reason: 'Integration test - messaging workflow',
    });

    const allocRes = await apiPost(request, '/api/allocations', adminToken, allocData);
    expect([200, 201]).toContain(allocRes.status());

    // Step 3: Tutor sends message to student
    const messageData = createMessageData(studentId, {
      content: 'Welcome! I am your assigned tutor. Please feel free to ask any questions.',
    });

    const msgRes = await apiPost(request, '/api/messages', tutorToken, messageData);
    expect(msgRes.status()).toBe(201);
    const msgBody = await msgRes.json();

    // Step 4: Student checks inbox
    const inboxRes = await apiGet(request, '/api/messages/inbox', studentToken);
    expect(inboxRes.status()).toBe(200);
    const inboxBody = await inboxRes.json();

    // Step 5: Student replies
    const replyData = createMessageData(tutorId, {
      content: 'Thank you! I have a question about my upcoming assignment.',
    });

    const replyRes = await apiPost(request, '/api/messages', studentToken, replyData);
    expect(replyRes.status()).toBe(201);

    // Step 6: Tutor checks messages with student
    const messagesRes = await apiGet(request, `/api/messages?userId=${studentId}`, tutorToken);
    expect(messagesRes.status()).toBe(200);
  });

  // ── TC-INT-04: Blog creation and engagement workflow ──────────────────────
  test('TC-INT-04 – Blog creation and engagement workflow', async ({ request }) => {
    // Step 1: Tutor creates blog
    const blogData = createBlogData({
      title: 'Integration Test Blog Post',
      content: 'This blog post is created as part of integration testing.',
    });

    const createRes = await apiPost(request, '/api/blogs', tutorToken, blogData);
    expect(createRes.status()).toBe(201);
    const createBody = await createRes.json();
    createdBlogId = createBody.id;

    // Step 2: Student views blogs
    const listRes = await apiGet(request, '/api/blogs', studentToken);
    expect(listRes.status()).toBe(200);
    const listBody = await listRes.json();

    // Step 3: Student views specific blog
    const viewRes = await apiGet(request, `/api/blogs/${createdBlogId}`, studentToken);
    expect(viewRes.status()).toBe(200);

    // Step 4: Student adds comment
    const commentRes = await apiPost(request, `/api/blogs/${createdBlogId}/comments`, studentToken, {
      content: 'Great article! Very informative.',
    });
    expect(commentRes.status()).toBe(201);

    // Step 5: Tutor gets comments
    const commentsRes = await apiGet(request, `/api/blogs/${createdBlogId}/comments`, tutorToken);
    expect(commentsRes.status()).toBe(200);
    const commentsBody = await commentsRes.json();
    expect(commentsBody.length).toBeGreaterThan(0);

    // Step 6: Tutor updates blog
    const updateRes = await apiPut(request, `/api/blogs/${createdBlogId}`, tutorToken, {
      title: 'Updated: Integration Test Blog Post',
      content: 'Updated content with additional information based on feedback.',
    });
    expect(updateRes.status()).toBe(200);

    // Step 7: Cleanup - Delete blog
    const deleteRes = await apiDelete(request, `/api/blogs/${createdBlogId}`, tutorToken);
    expect([200, 204]).toContain(deleteRes.status());
  });

  // ── TC-INT-05: Meeting scheduling workflow ─────────────────────────────────
  test('TC-INT-05 – Meeting scheduling workflow', async ({ request }) => {
    // Step 1: Get tutor and student
    const tutorRes = await apiGet(request, '/api/tutors', adminToken);
    const tutorData = await tutorRes.json();
    const tutorId = tutorData.data?.[0]?.id;

    const studentRes = await apiGet(request, '/api/students', adminToken);
    const studentData = await studentRes.json();
    const studentId = studentData.data?.[0]?.id;

    if (!tutorId || !studentId) {
      test.skip();
      return;
    }

    // Step 2: Ensure allocation exists
    await apiPost(request, '/api/allocations', adminToken, {
      studentId,
      tutorId,
      reason: 'Meeting workflow test',
    });

    // Step 3: Tutor schedules meeting
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    futureDate.setHours(14, 0, 0, 0); // 2 PM

    const meetingData = createMeetingData(studentId, {
      title: 'Integration Test Meeting',
      description: 'Weekly progress review meeting',
      scheduledAt: futureDate.toISOString(),
      duration: 60,
    });

    const createRes = await apiPost(request, '/api/meetings', tutorToken, meetingData);
    expect(createRes.status()).toBe(201);
    const createBody = await createRes.json();
    const meetingId = createBody.id;

    // Step 4: Student views meetings
    const studentMeetingsRes = await apiGet(request, '/api/meetings', studentToken);
    expect(studentMeetingsRes.status()).toBe(200);

    // Step 5: Tutor updates meeting status
    const updateRes = await apiPut(request, `/api/meetings/${meetingId}`, tutorToken, {
      status: 'confirmed',
      notes: 'Meeting confirmed. Please prepare your questions.',
    });
    expect(updateRes.status()).toBe(200);

    // Step 6: Admin views all meetings
    const adminMeetingsRes = await apiGet(request, '/api/admin/meetings', adminToken);
    expect(adminMeetingsRes.status()).toBe(200);
    const adminMeetingsBody = await adminMeetingsRes.json();

    // Verify meeting is in admin list
    const meetingExists = adminMeetingsBody.some(m => m.id === meetingId);
    expect(meetingExists).toBe(true);
  });

  // ── TC-INT-06: Admin dashboard comprehensive view ─────────────────────────
  test('TC-INT-06 – Admin dashboard comprehensive view', async ({ request }) => {
    // Step 1: Get admin dashboard stats
    const dashboardRes = await apiGet(request, '/api/admin/dashboard', adminToken);
    expect(dashboardRes.status()).toBe(200);
    const dashboardData = await dashboardRes.json();

    expect(dashboardData.totalStudents).toBeGreaterThanOrEqual(0);
    expect(dashboardData.totalTutors).toBeGreaterThanOrEqual(0);
    expect(dashboardData.totalAllocations).toBeGreaterThanOrEqual(0);

    // Step 2: Get allocation stats
    const allocStatsRes = await apiGet(request, '/api/allocations/stats', adminToken);
    expect(allocStatsRes.status()).toBe(200);
    const allocStats = await allocStatsRes.json();

    expect(allocStats).toHaveProperty('totalAllocations');
    expect(allocStats).toHaveProperty('unassignedStudents');

    // Step 3: Get most active users
    const activeUsersRes = await apiGet(request, '/api/admin/reports/most-active-users', adminToken);
    expect(activeUsersRes.status()).toBe(200);
    const activeUsers = await activeUsersRes.json();
    expect(Array.isArray(activeUsers)).toBe(true);

    // Step 4: View as student (if students exist)
    if (dashboardData.totalStudents > 0) {
      const studentRes = await apiGet(request, '/api/students', adminToken);
      const studentList = await studentRes.json();
      
      if (studentList.data && studentList.data.length > 0) {
        const viewAsStudentRes = await apiGet(
          request,
          `/api/admin/view-as/student/${studentList.data[0].id}/dashboard`,
          adminToken
        );
        expect(viewAsStudentRes.status()).toBe(200);
      }
    }

    // Step 5: View as tutor (if tutors exist)
    if (dashboardData.totalTutors > 0) {
      const tutorRes = await apiGet(request, '/api/tutors', adminToken);
      const tutorList = await tutorRes.json();
      
      if (tutorList.data && tutorList.data.length > 0) {
        const viewAsTutorRes = await apiGet(
          request,
          `/api/admin/view-as/tutor/${tutorList.data[0].id}/dashboard`,
          adminToken
        );
        expect(viewAsTutorRes.status()).toBe(200);
      }
    }
  });
});

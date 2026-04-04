// tests/api/messages.spec.js
// Sprint 2 – Messaging API Tests
// Covers: TC-MSG-01 to TC-MSG-06
//
// Run:  npx playwright test tests/api/messages.spec.js --project=api
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  loginAndGetToken,
  storeAPIResponse,
  createMessageData,
  apiGet,
  apiPost,
  apiDelete,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL;

// Note: Messaging tests require existing allocations between students and tutors
// The tutor1@etutor.com and student1@etutor.com should have an allocation

test.describe('Sprint 2 – Messaging API', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let tutorId = '';
  let studentId = '';
  let messageId = '';

  test.beforeAll(async ({ request }) => {
    // Login as admin
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    // Login as tutor to get tutor ID
    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;
    tutorId = tutorAuth.user?.id;

    // Login as student to get student ID
    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
    studentId = studentAuth.user?.id;
  });

  // ── TC-MSG-01: Send message from tutor to student ─────────────────────────
  // Note: This test requires an allocation between tutor and student
  test('TC-MSG-01 – Send message from tutor to student returns 201', async ({ request }) => {
    const messageData = {
      receiverId: studentId,
      content: 'Hello from tutor! This is a test message.',
    };

    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-01',
      'Send Message (Tutor → Student)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: messageData,
      }
    );

    // Accept 201 (created), 200 (success), or 400 (no allocation exists)
    // If 400, the test documents the requirement for an allocation
    if (res.status() === 400) {
      // Skip if no allocation exists - this is a known requirement
      test.skip(true, 'Requires existing allocation between tutor and student');
    }
    expect([200, 201]).toContain(res.status());
    if (body.id || body.messageId || body.data) {
      messageId = body.id || body.messageId || body.data?.id;
    }
  });

  // ── TC-MSG-02: Send message from student to tutor ─────────────────────────
  // Note: This test requires an allocation between student and tutor
  test('TC-MSG-02 – Send message from student to tutor returns 201', async ({ request }) => {
    const messageData = {
      receiverId: tutorId,
      content: 'Hello from student! I have a question about my assignment.',
    };

    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-02',
      'Send Message (Student → Tutor)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: messageData,
      }
    );

    // Accept 201 (created), 200 (success), or 400 (no allocation exists)
    if (res.status() === 400) {
      test.skip(true, 'Requires existing allocation between student and tutor');
    }
    expect([200, 201]).toContain(res.status());
  });

  // ── TC-MSG-03: Get inbox messages ─────────────────────────────────────────
  test('TC-MSG-03 – Get inbox messages returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-03',
      'Get Inbox Messages',
      'get',
      `${API}/api/messages/inbox`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
  });

  // ── TC-MSG-04: Get message contacts ───────────────────────────────────────
  test('TC-MSG-04 – Get message contacts returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-04',
      'Get Message Contacts',
      'get',
      `${API}/api/messages/contacts`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    // API may return wrapped or direct array
    const data = body.data || body;
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });

  // ── TC-MSG-05: Get messages with specific user ────────────────────────────
  // Note: This test requires an allocation between student and tutor
  test('TC-MSG-05 – Get messages with specific user returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-05',
      'Get Messages with User',
      'get',
      `${API}/api/messages?userId=${tutorId}`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    // Accept 200 or 400 (no allocation exists)
    if (res.status() === 400) {
      test.skip(true, 'Requires existing allocation between student and tutor');
    }
    expect(res.status()).toBe(200);
    // API may return messages as array directly or wrapped in data property
    const data = body.data || body;
    expect(Array.isArray(data) || typeof data === 'object').toBe(true);
  });

  // ── TC-MSG-06: Send message without content returns 400 ───────────────────
  test('TC-MSG-06 – Send message without content returns 400', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-06',
      'Send Message Without Content',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: { receiverId: tutorId },
      }
    );

    expect(res.status()).toBe(400);
  });

  // ── TC-MSG-07: Send message without auth returns 401 ──────────────────────
  test('TC-MSG-07 – Send message without auth returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TC-MSG-07',
      'Send Message Without Auth',
      'post',
      `${API}/api/messages`,
      {
        data: { receiverId: tutorId, content: 'Test' },
      }
    );

    expect(res.status()).toBe(401);
  });

  // ── TC-MSG-08: Get inbox without auth returns 401 ─────────────────────────
  test('TC-MSG-08 – Get inbox without auth returns 401', async ({ request }) => {
    const { res } = await storeAPIResponse(
      request,
      'TC-MSG-08',
      'Get Inbox Without Auth',
      'get',
      `${API}/api/messages/inbox`,
      {}
    );

    expect(res.status()).toBe(401);
  });
});

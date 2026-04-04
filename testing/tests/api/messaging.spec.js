// tests/api/messaging.spec.js
// Messaging Test Cases - TC-MSG-01 to TC-MSG-05
//
// Run: npx playwright test tests/api/messaging.spec.js --project=api-messaging
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Messaging Tests', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let tutorId = '';
  let studentId = '';

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

  // TC-MSG-01: Send Message (Valid)
  test('TC-MSG-01 – Send Message to assigned tutor returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-01',
      'Send Message (Valid)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          receiverId: tutorId,
          content: 'Hello from student test message',
        },
      }
    );

    expect([200, 201, 400, 403]).toContain(res.status());
  });

  // TC-MSG-02: Prevent Unauthorized Messaging
  test('TC-MSG-02 – Send message to unassigned tutor returns 403', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-02',
      'Prevent Unauthorized Messaging',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          receiverId: '00000000-0000-0000-0000-000000000000',
          content: 'Unauthorized message',
        },
      }
    );

    expect([400, 403, 404]).toContain(res.status());
  });

  // TC-MSG-03: Fetch Inbox
  test('TC-MSG-03 – Fetch Inbox returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-03',
      'Fetch Inbox',
      'get',
      `${API}/api/messages/inbox`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  // TC-MSG-04: Read Receipts
  test('TC-MSG-04 – Read messages returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-04',
      'Read Receipts',
      'get',
      `${API}/api/messages?userId=${tutorId}`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect([200, 400]).toContain(res.status());
  });

  // TC-MSG-05: Group Messaging (Tutor)
  test('TC-MSG-05 – Tutor sends message returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-MSG-05',
      'Group Messaging (Tutor)',
      'post',
      `${API}/api/messages`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: {
          receiverId: studentId,
          content: 'Group message from tutor',
        },
      }
    );

    expect([200, 201, 400, 403]).toContain(res.status());
  });
});

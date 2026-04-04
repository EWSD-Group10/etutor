// tests/api/student-reports.spec.js
// Student Analytics Reports - TC-RPT-12 to TC-RPT-15
//
// Run: npx playwright test tests/api/student-reports.spec.js --project=api-student-reports
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

test.describe('Student Analytics Reports', () => {
  let studentToken = '';
  let tutorToken = '';

  test.beforeAll(async ({ request }) => {
    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;
  });

  // TC-RPT-12: View Allocated Tutor Info
  test('TC-RPT-12 – View Allocated Tutor Info returns tutor details', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-12',
      'View Allocated Tutor Info',
      'get',
      `${API}/api/students/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('assignedTutor');
  });

  // TC-RPT-13: View Upcoming Meetings
  test('TC-RPT-13 – View Upcoming Meetings returns next meeting details', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-13',
      'View Upcoming Meetings',
      'get',
      `${API}/api/students/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('nextMeeting');
    expect(data).toHaveProperty('summary');
  });

  // TC-RPT-14: View Recent Documents & Blogs
  test('TC-RPT-14 – View Recent Documents & Blogs returns last 5 items', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-14',
      'View Recent Documents & Blogs',
      'get',
      `${API}/api/students/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('recentDocuments');
    expect(data).toHaveProperty('recentBlogPosts');
  });

  // TC-RPT-15: View Message Summary
  test('TC-RPT-15 – View Message Summary returns unread count and 7-day activity', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-15',
      'View Message Summary',
      'get',
      `${API}/api/students/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('summary');
    expect(data.summary).toHaveProperty('unreadMessages');
    expect(data.summary).toHaveProperty('messagesLast7Days');
  });
});

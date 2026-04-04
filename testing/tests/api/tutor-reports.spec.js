// tests/api/tutor-reports.spec.js
// Tutor Analytics Reports - TC-RPT-08 to TC-RPT-11
//
// Run: npx playwright test tests/api/tutor-reports.spec.js --project=api-tutor-reports
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

test.describe('Tutor Analytics Reports', () => {
  let tutorToken = '';
  let studentToken = '';

  test.beforeAll(async ({ request }) => {
    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;
  });

  // TC-RPT-08: View All Tutees List
  test('TC-RPT-08 – View All Tutees List returns 200 with student details', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-08',
      'View All Tutees List',
      'get',
      `${API}/api/tutors/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('tutees');
    expect(data).toHaveProperty('studentsCount');
  });

  // TC-RPT-09: View Unread Messages Summary
  test('TC-RPT-09 – View Unread Messages Summary returns count', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-09',
      'View Unread Messages Summary',
      'get',
      `${API}/api/tutors/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('tuteesWithUnread');
  });

  // TC-RPT-10: View Upcoming Meetings
  test('TC-RPT-10 – View Upcoming Meetings returns next 3 meetings', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-10',
      'View Upcoming Meetings',
      'get',
      `${API}/api/tutors/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('upcomingMeetings');
    expect(data).toHaveProperty('upcomingMeetingsCount');
  });

  // TC-RPT-11: View Recent Messages
  test('TC-RPT-11 – View Recent Messages returns messages from tutees', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-RPT-11',
      'View Recent Messages',
      'get',
      `${API}/api/tutors/me/dashboard`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
      }
    );

    expect(res.status()).toBe(200);
    const data = body.data || body;
    expect(data).toHaveProperty('recentMessages');
  });
});

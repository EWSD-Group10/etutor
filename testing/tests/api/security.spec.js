// tests/api/security.spec.js
// Security Test Cases - TC-SEC-01 to TC-SEC-03
//
// Run: npx playwright test tests/api/security.spec.js --project=api-security
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiPost,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Security Tests', () => {
  // TC-SEC-01: Token Expiry
  test('TC-SEC-01 – Expired token returns 401', async ({ request }) => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidW5kZWZpbmVkIjp0cnVlLCJpYXQiOjE1MDAwMDAwMDB9.invalid';

    const { res, body } = await storeAPIResponse(
      request,
      'TC-SEC-01',
      'Token Expiry',
      'get',
      `${API}/api/current-user`,
      {
        headers: { Authorization: `Bearer ${expiredToken}` },
      }
    );

    expect([401, 403]).toContain(res.status());
  });

  // TC-SEC-02: SQL Injection (Basic)
  test('TC-SEC-02 – SQL Injection attempt handled safely', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-SEC-02',
      'SQL Injection',
      'post',
      `${API}/api/login`,
      {
        data: {
          email: "admin' OR '1'='1 --",
          password: 'anypassword',
        },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect([401, 400]).toContain(res.status());
  });

  // TC-SEC-03: Last Login Display
  test('TC-SEC-03 – Last Login displayed after login', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-SEC-03',
      'Last Login Display',
      'post',
      `${API}/api/login`,
      {
        data: CREDENTIALS.admin,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    expect(res.status()).toBe(200);
    expect(body).toHaveProperty('lastLoginAt');
  });
});

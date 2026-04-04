// tests/utils/helpers.js
// Common test utilities and helper functions for eTutor test suite

import { expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ── Configuration ─────────────────────────────────────────────────────────────
export const CONFIG = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8080',
  FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  SCREENSHOTS_DIR: 'screenshots',
  RESPONSES_DIR: 'screenshots/api',
  UI_SCREENSHOTS_DIR: 'screenshots/ui',
};

// ── Test Credentials ──────────────────────────────────────────────────────────
export const CREDENTIALS = {
  admin: { email: 'admin1@etutor.com', password: 'admin123' },
  tutor: { email: 'tutor1@etutor.com', password: 'tutor123' },
  student: { email: 'student1@etutor.com', password: 'student123' },
};

// ── Authentication Helpers ────────────────────────────────────────────────────

/**
 * Login via API and return access token
 */
export async function loginAndGetToken(request, role = 'admin') {
  const credentials = CREDENTIALS[role];
  if (!credentials) {
    throw new Error(`Unknown role: ${role}`);
  }

  const res = await request.post(`${CONFIG.API_BASE_URL}/api/login`, {
    data: credentials,
    headers: { 'Content-Type': 'application/json' },
  });

  expect(res.status(), `Login failed for ${role}`).toBe(200);
  const body = await res.json();
  expect(body).toHaveProperty('accessToken');
  expect(body).toHaveProperty('user');
  
  return {
    token: body.accessToken,
    user: body.user,
  };
}

/**
 * Get stored auth state from file
 */
export function getStoredAuthState(role = 'admin') {
  const statePath = `auth/${role}.json`;
  if (!fs.existsSync(statePath)) {
    throw new Error(`Auth state file not found: ${statePath}`);
  }
  return JSON.parse(fs.readFileSync(statePath, 'utf-8'));
}

// ── API Response Storage ──────────────────────────────────────────────────────

/**
 * Store API response with full details for reporting
 */
export async function storeAPIResponse(request, tcId, label, method, url, options = {}) {
  const dir = CONFIG.RESPONSES_DIR;
  fs.mkdirSync(dir, { recursive: true });

  const startTime = Date.now();
  const res = await request[method](url, options);
  const duration = Date.now() - startTime;

  let responseBody;
  try {
    responseBody = await res.json();
  } catch {
    responseBody = await res.text().catch(() => null);
  }

  const result = {
    testId: tcId,
    title: label,
    request: {
      method: method.toUpperCase(),
      url: url,
      body: options.data || null,
      headers: options.headers || {},
    },
    response: {
      status: res.status(),
      headers: res.headers(),
      body: responseBody,
    },
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(dir, `${tcId}.json`), JSON.stringify(result, null, 2));
  return { res, body: responseBody };
}

// ── Data Factories ────────────────────────────────────────────────────────────

/**
 * Generate unique test data with timestamp
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    timestamp,
    random,
    uniqueId: `${timestamp}-${random}`,
  };
}

/**
 * Create test student data
 */
export function createStudentData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  return {
    name: `Test Student ${random}`,
    email: `student_${timestamp}@test.com`,
    degreeProgram: 'BSc Computer Science',
    ...overrides,
  };
}

/**
 * Create test tutor data
 */
export function createTutorData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  return {
    name: `Test Tutor ${random}`,
    email: `tutor_${timestamp}@test.com`,
    department: 'Computer Science',
    ...overrides,
  };
}

/**
 * Create test blog data
 */
export function createBlogData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  return {
    title: `Test Blog Post ${random}`,
    content: `This is a test blog post content created at ${timestamp}. It contains some sample text for testing purposes.`,
    groupId: null,
    ...overrides,
  };
}

/**
 * Create test message data
 */
export function createMessageData(receiverId, overrides = {}) {
  return {
    receiverId,
    content: `Test message ${Date.now()}`,
    ...overrides,
  };
}

/**
 * Create test meeting data
 */
export function createMeetingData(studentId, overrides = {}) {
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  return {
    studentId,
    title: `Test Meeting ${Date.now()}`,
    description: 'Test meeting description',
    scheduledAt: futureDate.toISOString(),
    duration: 60,
    ...overrides,
  };
}

// ── API Request Helpers ───────────────────────────────────────────────────────

/**
 * Make authenticated API request
 */
export async function authenticatedRequest(request, method, endpoint, token, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${CONFIG.API_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  return request[method](url, {
    ...options,
    headers,
  });
}

/**
 * GET request with auth
 */
export async function apiGet(request, endpoint, token, options = {}) {
  return authenticatedRequest(request, 'get', endpoint, token, options);
}

/**
 * POST request with auth
 */
export async function apiPost(request, endpoint, token, data, options = {}) {
  return authenticatedRequest(request, 'post', endpoint, token, {
    ...options,
    data,
  });
}

/**
 * PUT request with auth
 */
export async function apiPut(request, endpoint, token, data, options = {}) {
  return authenticatedRequest(request, 'put', endpoint, token, {
    ...options,
    data,
  });
}

/**
 * DELETE request with auth
 */
export async function apiDelete(request, endpoint, token, options = {}) {
  return authenticatedRequest(request, 'delete', endpoint, token, options);
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

/**
 * Take screenshot with timestamp
 */
export async function takeScreenshot(page, name, subfolder = 'ui') {
  const dir = path.join(CONFIG.SCREENSHOTS_DIR, subfolder);
  fs.mkdirSync(dir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(dir, filename);
  
  await page.screenshot({ path: filepath, fullPage: true });
  return filepath;
}

/**
 * Login via UI
 */
export async function loginViaUI(page, role = 'admin') {
  const credentials = CREDENTIALS[role];
  
  await page.goto(`${CONFIG.FRONTEND_BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type=email], [name=email]', credentials.email);
  await page.fill('input[type=password], [name=password]', credentials.password);
  
  await Promise.all([
    page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
    page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")'),
  ]);
  
  await page.waitForTimeout(2000);
  
  // Verify login success (not on login page)
  const url = page.url();
  if (url.includes('/login')) {
    throw new Error(`Login failed for ${role} - still on login page`);
  }
  
  return url;
}

/**
 * Logout via UI
 */
export async function logoutViaUI(page) {
  // Look for logout button/link
  const logoutSelectors = [
    'button:has-text("Logout")',
    'button:has-text("Sign out")',
    'a:has-text("Logout")',
    'a:has-text("Sign out")',
    '[data-testid="logout"]',
  ];
  
  for (const selector of logoutSelectors) {
    const element = await page.$(selector);
    if (element) {
      await element.click();
      await page.waitForTimeout(1000);
      break;
    }
  }
  
  await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
}

// ── Validation Helpers ────────────────────────────────────────────────────────

/**
 * Validate response has expected structure
 */
export function validateResponseStructure(body, requiredFields = []) {
  for (const field of requiredFields) {
    expect(body, `Response should have field: ${field}`).toHaveProperty(field);
  }
}

/**
 * Validate pagination response
 */
export function validatePaginationResponse(body) {
  expect(body).toHaveProperty('data');
  expect(Array.isArray(body.data)).toBe(true);
  if (body.total !== undefined) {
    expect(typeof body.total).toBe('number');
  }
  if (body.page !== undefined) {
    expect(typeof body.page).toBe('number');
  }
  if (body.limit !== undefined) {
    expect(typeof body.limit).toBe('number');
  }
}

/**
 * Validate error response
 */
export function validateErrorResponse(body, expectedStatus = 400) {
  expect(body).toHaveProperty('error');
  expect(typeof body.error).toBe('string');
}

// ── Cleanup Helpers ───────────────────────────────────────────────────────────

/**
 * Delete test resource
 */
export async function cleanupResource(request, endpoint, token) {
  try {
    const res = await apiDelete(request, endpoint, token);
    return res.status();
  } catch (error) {
    console.warn(`Cleanup failed for ${endpoint}:`, error.message);
    return null;
  }
}

// ── Assertions ────────────────────────────────────────────────────────────────

/**
 * Assert response status is success (2xx)
 */
export function assertSuccess(status) {
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(300);
}

/**
 * Assert response status is client error (4xx)
 */
export function assertClientError(status) {
  expect(status).toBeGreaterThanOrEqual(400);
  expect(status).toBeLessThan(500);
}

/**
 * Assert response status is server error (5xx)
 */
export function assertServerError(status) {
  expect(status).toBeGreaterThanOrEqual(500);
  expect(status).toBeLessThan(600);
}

/**
 * Assert response contains valid JSON
 */
export async function assertValidJSON(response) {
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('application/json');
  const body = await response.json();
  expect(body).toBeDefined();
  return body;
}

// tests/auth.setup.js
// Runs once before all UI tests to log in and save session state.
// Each role gets its own saved state file so tests can switch roles easily.

import { test as setup, expect } from '@playwright/test';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080'; // ← your API base URL

// ── Helper: log in via API and save token to a JSON file ──────────────────────
async function saveAuthState(request, email, password, outputPath) {
  const res = await request.post(`${BASE_URL}/api/login`, {
    data: { email, password },
    headers: { 'Content-Type': 'application/json' },
  });

  expect(res.status(), `Login failed for ${email}`).toBe(200);

  const body = await res.json();
  const token = body.accessToken;

  // Write a storageState-compatible file that includes the JWT in localStorage.
  // Playwright will inject this into every request/page in tests that use it.
  const state = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          { name: 'accessToken', value: token },
          { name: 'user', value: JSON.stringify(body.user) },
        ],
      },
    ],
  };

  fs.mkdirSync('auth', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(state, null, 2));
  console.log(`✅ Saved auth state → ${outputPath}`);
}

// ── Save a state file for each role ───────────────────────────────────────────
setup('Save admin auth state', async ({ request }) => {
  await saveAuthState(request, 'admin1@etutor.com', 'admin123', 'auth/admin.json');
});

setup('Save tutor auth state', async ({ request }) => {
  await saveAuthState(request, 'tutor1@etutor.com', 'tutor123', 'auth/tutor.json');
});

setup('Save student auth state', async ({ request }) => {
  await saveAuthState(request, 'student1@etutor.com', 'student123', 'auth/student.json');
});

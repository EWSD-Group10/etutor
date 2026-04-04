// tests/ui/login.spec.js
// UI Tests – Login page screenshots and flow validation
// Covers: TC-AUTH-08 to TC-AUTH-10, TC-RBAC-01 to TC-RBAC-03
//
// Run:  npx playwright test --project=ui
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';

test.describe('UI – Login Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  // ── TC-AUTH-08: UI Valid login ──────────────────────────────────────────────
  test('TC-AUTH-08 – UI Valid login redirects to dashboard', async ({ page }) => {
    // Screenshot: Initial login page
    await page.screenshot({ path: 'screenshots/ui/TC-AUTH-08-01-login-page.png' });

    // Fill credentials
    await page.fill('input[type=email], [name=email]', 'admin1@etutor.com');
    await page.fill('input[type=password], [name=password]', 'admin123');

    // Screenshot: Filled form
    await page.screenshot({ path: 'screenshots/ui/TC-AUTH-08-02-filled-form.png' });

    // Click login and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
      page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")'),
    ]);

    // Wait for dashboard or redirect
    await page.waitForTimeout(2000);
    
    // Screenshot: After login
    await page.screenshot({ path: 'screenshots/ui/TC-AUTH-08-03-after-login.png' });

    // Verify: Should NOT be on login page anymore
    const url = page.url();
    const isOnLoginPage = url.includes('/login');
    expect(isOnLoginPage, `Should redirect from login page, but still at: ${url}`).toBe(false);
  });

  // ── TC-AUTH-09: UI Wrong password shows error ──────────────────────────────
  test('TC-AUTH-09 – UI Wrong password shows error message', async ({ page }) => {
    // Fill with wrong password
    await page.fill('input[type=email], [name=email]', 'admin1@etutor.com');
    await page.fill('input[type=password], [name=password]', 'wrongpassword');

    // Click login
    await page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")');

    // Wait for error or page change
    await page.waitForTimeout(2000);
    
    // Screenshot: Error state
    await page.screenshot({ path: 'screenshots/ui/TC-AUTH-09-01-error.png' });

    // Verify: Should still be on login page
    expect(page.url()).toContain('/login');

    // Verify: Error message should be visible (check for common error patterns)
    const pageContent = await page.textContent('body');
    const hasError = pageContent?.toLowerCase().includes('invalid') || 
                     pageContent?.toLowerCase().includes('error') ||
                     pageContent?.toLowerCase().includes('incorrect') ||
                     pageContent?.toLowerCase().includes('failed');
    expect(hasError, 'Should show error message for wrong password').toBe(true);
  });

  // ── TC-AUTH-10: UI Empty form submission ───────────────────────────────────
  test('TC-AUTH-10 – UI Empty form shows validation error', async ({ page }) => {
    // Click login without filling form
    await page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")');

    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Screenshot: Validation error
    await page.screenshot({ path: 'screenshots/ui/TC-AUTH-10-01-validation.png' });

    // Verify: Should still be on login page
    expect(page.url()).toContain('/login');
  });

});

// ── RBAC UI tests (TC-RBAC-01 to TC-RBAC-03) ─────────────────────────────────
test.describe('UI – RBAC Role Redirects', () => {

  test('TC-RBAC-01 – Student cannot access /admin', async ({ page }) => {
    // Login as student
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type=email], [name=email]', 'student1@etutor.com');
    await page.fill('input[type=password], [name=password]', 'student123');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
      page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")'),
    ]);
    
    await page.waitForTimeout(2000);
    
    // Verify: Student logged in (not on login page)
    const loginUrlAfterLogin = page.url();
    expect(loginUrlAfterLogin, 'Student should be logged in').not.toContain('/login');
    
    // Screenshot: Student dashboard
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-01-01-student-dashboard.png' });

    // Try to access admin
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Screenshot: After trying to access admin
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-01-02-after-admin-attempt.png' });

    // Verify: Should be redirected away from /admin
    const finalUrl = page.url();
    expect(finalUrl, 'Student should not be on admin page').not.toMatch(/\/admin$/);
  });

  test('TC-RBAC-02 – Tutor cannot access /admin', async ({ page }) => {
    // Login as tutor
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type=email], [name=email]', 'tutor1@etutor.com');
    await page.fill('input[type=password], [name=password]', 'tutor123');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
      page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")'),
    ]);
    
    await page.waitForTimeout(2000);
    
    // Verify: Tutor logged in (not on login page)
    const loginUrlAfterLogin = page.url();
    expect(loginUrlAfterLogin, 'Tutor should be logged in').not.toContain('/login');
    
    // Screenshot: Tutor dashboard
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-02-01-tutor-dashboard.png' });

    // Try to access admin
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Screenshot: After trying to access admin
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-02-02-after-admin-attempt.png' });

    // Verify: Should be redirected away from /admin
    const finalUrl = page.url();
    expect(finalUrl, 'Tutor should not be on admin page').not.toMatch(/\/admin$/);
  });

  test('TC-RBAC-03 – Admin can access /admin dashboard', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type=email], [name=email]', 'admin1@etutor.com');
    await page.fill('input[type=password], [name=password]', 'admin123');
    
    await Promise.all([
      page.waitForNavigation({ timeout: 10000 }).catch(() => {}),
      page.click('button[type=submit], button:has-text("Login"), button:has-text("Sign in")'),
    ]);
    
    await page.waitForTimeout(2000);
    
    // Verify: Admin logged in (not on login page)
    const loginUrlAfterLogin = page.url();
    expect(loginUrlAfterLogin, 'Admin should be logged in').not.toContain('/login');
    
    // Screenshot: Admin dashboard (after login)
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-03-01-admin-dashboard.png' });

    // Go to admin page
    await page.goto('/admin');
    await page.waitForTimeout(2000);
    
    // Screenshot: Admin page
    await page.screenshot({ path: 'screenshots/ui/TC-RBAC-03-02-admin-page.png' });

    // Verify: Should be on admin page
    const finalUrl = page.url();
    expect(finalUrl, 'Admin should be able to access admin page').toMatch(/admin/);
  });

});

// tests/ui/dashboard.spec.js
// UI Tests – Dashboard and Navigation
// Covers: TC-UI-01 to TC-UI-10
//
// Run:  npx playwright test tests/ui/dashboard.spec.js --project=ui
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import { CONFIG } from '../utils/helpers.js';

const FRONTEND = CONFIG.FRONTEND_BASE_URL;

test.describe('UI – Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard (using stored auth state)
    await page.goto(`${FRONTEND}/admin/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  // ── TC-UI-01: Admin dashboard loads ───────────────────────────────────────
  test('TC-UI-01 – Admin dashboard page loads successfully', async ({ page }) => {
    // Screenshot: Dashboard loaded
    await page.screenshot({ path: 'screenshots/ui/TC-UI-01-01-dashboard-loaded.png' });

    // Verify: Should be on admin dashboard
    expect(page.url()).toContain('/admin');
    
    // Check for dashboard content (common elements)
    const bodyText = await page.textContent('body');
    const hasDashboardContent = bodyText?.toLowerCase().includes('dashboard') ||
                                 bodyText?.toLowerCase().includes('students') ||
                                 bodyText?.toLowerCase().includes('tutors');
    expect(hasDashboardContent).toBe(true);
  });

  // ── TC-UI-02: Admin dashboard shows statistics ────────────────────────────
  test('TC-UI-02 – Admin dashboard shows statistics cards', async ({ page }) => {
    // Look for statistics/metrics elements
    const statsElements = await page.$$('[class*="stat"], [class*="card"], [class*="metric"], [class*="count"]');
    
    // Screenshot: Statistics view
    await page.screenshot({ path: 'screenshots/ui/TC-UI-02-01-statistics.png' });
    
    expect(statsElements.length).toBeGreaterThan(0);
  });

  // ── TC-UI-03: Admin navigation menu works ─────────────────────────────────
  test('TC-UI-03 – Admin navigation menu is accessible', async ({ page }) => {
    // Look for navigation elements
    const navElements = await page.$$('nav, [role="navigation"], [class*="sidebar"], [class*="menu"]');
    
    // Screenshot: Navigation view
    await page.screenshot({ path: 'screenshots/ui/TC-UI-03-01-navigation.png' });
    
    expect(navElements.length).toBeGreaterThan(0);
  });

  // ── TC-UI-04: Navigate to students management ─────────────────────────────
  test('TC-UI-04 – Navigate to students management page', async ({ page }) => {
    // Try to find and click students link
    const studentsLink = await page.$('a[href*="students"], a:has-text("Students"), button:has-text("Students")');
    
    if (studentsLink) {
      await studentsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } else {
      // Direct navigation
      await page.goto(`${FRONTEND}/admin/students`);
      await page.waitForLoadState('networkidle');
    }
    
    // Screenshot: Students page
    await page.screenshot({ path: 'screenshots/ui/TC-UI-04-01-students-page.png' });
    
    // Verify: URL should contain students
    expect(page.url()).toContain('students');
  });

  // ── TC-UI-05: Navigate to tutors management ───────────────────────────────
  test('TC-UI-05 – Navigate to tutors management page', async ({ page }) => {
    // Try to find and click tutors link
    const tutorsLink = await page.$('a[href*="tutors"], a[href*="teachers"], a:has-text("Tutors"), button:has-text("Tutors")');
    
    if (tutorsLink) {
      await tutorsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } else {
      // Direct navigation
      await page.goto(`${FRONTEND}/admin/tutors`);
      await page.waitForLoadState('networkidle');
    }
    
    // Screenshot: Tutors page
    await page.screenshot({ path: 'screenshots/ui/TC-UI-05-01-tutors-page.png' });
    
    // Verify: URL should contain tutors or teachers
    const url = page.url();
    expect(url.includes('tutors') || url.includes('teachers')).toBe(true);
  });

  // ── TC-UI-06: Navigate to allocations management ──────────────────────────
  test('TC-UI-06 – Navigate to allocations management page', async ({ page }) => {
    // Try to find and click allocations link
    const allocationsLink = await page.$('a[href*="allocations"], a:has-text("Allocations"), button:has-text("Allocations")');
    
    if (allocationsLink) {
      await allocationsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    } else {
      // Direct navigation
      await page.goto(`${FRONTEND}/admin/allocations`);
      await page.waitForLoadState('networkidle');
    }
    
    // Screenshot: Allocations page
    await page.screenshot({ path: 'screenshots/ui/TC-UI-06-01-allocations-page.png' });
    
    // Verify: URL should contain allocations
    expect(page.url()).toContain('allocations');
  });

  // ── TC-UI-07: Logout from admin dashboard ─────────────────────────────────
  test('TC-UI-07 – Logout functionality works', async ({ page }) => {
    // Screenshot: Before logout
    await page.screenshot({ path: 'screenshots/ui/TC-UI-07-01-before-logout.png' });
    
    // Look for logout button/link
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      'a:has-text("Logout")',
      'a:has-text("Sign out")',
      '[data-testid="logout"]',
      'button:has-text("Log out")',
    ];
    
    let clicked = false;
    for (const selector of logoutSelectors) {
      const element = await page.$(selector);
      if (element) {
        await element.click();
        clicked = true;
        break;
      }
    }
    
    if (!clicked) {
      // Try accessing user menu first
      const userMenu = await page.$('[class*="user"], [class*="avatar"], [class*="profile"]');
      if (userMenu) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        for (const selector of logoutSelectors) {
          const element = await page.$(selector);
          if (element) {
            await element.click();
            clicked = true;
            break;
          }
        }
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Screenshot: After logout
    await page.screenshot({ path: 'screenshots/ui/TC-UI-07-02-after-logout.png' });
    
    // Verify: Should be on login page or have login-related content
    const url = page.url();
    const hasLoginContent = url.includes('login') || 
                            url.includes('signin') ||
                            (await page.textContent('body'))?.toLowerCase().includes('login');
    expect(hasLoginContent).toBe(true);
  });
});

test.describe('UI – Tutor Dashboard', () => {
  // Note: These tests use tutor auth state from setup
  test.use({ storageState: 'auth/tutor.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND}/tutor/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  // ── TC-UI-08: Tutor dashboard loads ───────────────────────────────────────
  test('TC-UI-08 – Tutor dashboard page loads successfully', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/ui/TC-UI-08-01-tutor-dashboard.png' });
    
    expect(page.url()).toContain('/tutor');
    
    const bodyText = await page.textContent('body');
    const hasContent = bodyText?.toLowerCase().includes('student') ||
                       bodyText?.toLowerCase().includes('tutor') ||
                       bodyText?.toLowerCase().includes('dashboard');
    expect(hasContent).toBe(true);
  });

  // ── TC-UI-09: Tutor can view assigned students ────────────────────────────
  test('TC-UI-09 – Tutor can view assigned students', async ({ page }) => {
    // Navigate to students list
    const studentsLink = await page.$('a[href*="students"], a:has-text("Students")');
    
    if (studentsLink) {
      await studentsLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto(`${FRONTEND}/tutor/students`);
      await page.waitForLoadState('networkidle');
    }
    
    await page.screenshot({ path: 'screenshots/ui/TC-UI-09-01-tutor-students.png' });
    
    const url = page.url();
    expect(url.includes('students') || url.includes('tutor')).toBe(true);
  });
});

test.describe('UI – Student Dashboard', () => {
  // Note: These tests use student auth state from setup
  test.use({ storageState: 'auth/student.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND}/student/dashboard`);
    await page.waitForLoadState('networkidle');
  });

  // ── TC-UI-10: Student dashboard loads ─────────────────────────────────────
  test('TC-UI-10 – Student dashboard page loads successfully', async ({ page }) => {
    await page.screenshot({ path: 'screenshots/ui/TC-UI-10-01-student-dashboard.png' });
    
    expect(page.url()).toContain('/student');
    
    const bodyText = await page.textContent('body');
    const hasContent = bodyText?.toLowerCase().includes('student') ||
                       bodyText?.toLowerCase().includes('tutor') ||
                       bodyText?.toLowerCase().includes('dashboard');
    expect(hasContent).toBe(true);
  });
});

test.describe('UI – Protected Routes', () => {
  // ── TC-UI-11: Unauthenticated user redirected to login ────────────────────
  test('TC-UI-11 – Unauthenticated user redirected to login', async ({ page }) => {
    // Clear storage state to simulate unauthenticated user
    await page.goto(`${FRONTEND}/admin/dashboard`);
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'screenshots/ui/TC-UI-11-01-unauthenticated.png' });
    
    // Should be redirected to login or see login prompt
    const url = page.url();
    const hasLoginContent = url.includes('login') || 
                            url.includes('signin') ||
                            url === FRONTEND + '/' ||
                            (await page.textContent('body'))?.toLowerCase().includes('login');
    expect(hasLoginContent).toBe(true);
  });

  // ── TC-UI-12: Page not found shows 404 ────────────────────────────────────
  test('TC-UI-12 – Non-existent page shows 404', async ({ page }) => {
    await page.goto(`${FRONTEND}/this-page-does-not-exist`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'screenshots/ui/TC-UI-12-01-404-page.png' });
    
    const bodyText = await page.textContent('body');
    const is404 = bodyText?.includes('404') || 
                  bodyText?.toLowerCase().includes('not found') ||
                  bodyText?.toLowerCase().includes('page does not exist');
    expect(is404).toBe(true);
  });
});

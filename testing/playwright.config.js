// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60000,
  retries: 1,
  workers: 4,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Setup project - runs once before all tests
    {
      name: 'setup',
      testMatch: '**/auth.setup.js',
    },
    
    // API Tests
    {
      name: 'api',
      testMatch: '**/tests/api/sprint0-1.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-messages',
      testMatch: '**/tests/api/messages.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-meetings',
      testMatch: '**/tests/api/meetings.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-blogs',
      testMatch: '**/tests/api/blogs.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-documents',
      testMatch: '**/tests/api/documents.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-admin',
      testMatch: '**/tests/api/admin.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-integration',
      testMatch: '**/tests/api/integration.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-all-features',
      testMatch: '**/tests/api/all-features.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-auth',
      testMatch: '**/tests/api/auth.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-admin',
      testMatch: '**/tests/api/admin.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-allocation',
      testMatch: '**/tests/api/allocation.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-messaging',
      testMatch: '**/tests/api/messaging.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-meetings',
      testMatch: '**/tests/api/meetings.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-blogging',
      testMatch: '**/tests/api/blogging.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-documents',
      testMatch: '**/tests/api/documents.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-security',
      testMatch: '**/tests/api/security.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-admin-reports',
      testMatch: '**/tests/api/admin-reports.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-tutor-reports',
      testMatch: '**/tests/api/tutor-reports.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'api-student-reports',
      testMatch: '**/tests/api/student-reports.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    
    // UI Tests
    {
      name: 'ui-login',
      testMatch: '**/tests/ui/login.spec.js',
      dependencies: ['setup'],
      use: {
        storageState: 'auth/admin.json',
      },
    },
    {
      name: 'ui-dashboard',
      testMatch: '**/tests/ui/dashboard.spec.js',
      dependencies: ['setup'],
      use: {
        storageState: 'auth/admin.json',
      },
    },
    {
      name: 'ui-features',
      testMatch: '**/tests/ui/features.spec.js',
      dependencies: ['setup'],
      use: {
        storageState: 'auth/admin.json',
      },
    },
    
    // Combined projects for convenience
    {
      name: 'all-api',
      testMatch: '**/tests/api/*.spec.js',
      use: {
        baseURL: 'http://localhost:8080',
      },
    },
    {
      name: 'all-ui',
      testMatch: '**/tests/ui/*.spec.js',
      dependencies: ['setup'],
      use: {
        storageState: 'auth/admin.json',
      },
    },
  ],
});

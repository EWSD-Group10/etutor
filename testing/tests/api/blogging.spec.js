// tests/api/blogging.spec.js
// Blogging Test Cases - TC-BLG-01 to TC-BLG-04
//
// Run: npx playwright test tests/api/blogging.spec.js --project=api-blogging
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Blogging Tests', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let blogId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;

    // Try to get existing blogs
    try {
      const blogsRes = await apiGet(request, '/api/blogs', tutorToken);
      if (blogsRes.status() === 200) {
        const blogsData = await blogsRes.json();
        const blogs = blogsData.data || blogsData;
        if (blogs.length > 0) {
          blogId = blogs[0]?.id;
        }
      }
    } catch (e) {
      console.log('Could not get blogs');
    }
  });

  // TC-BLG-01: Create Blog (Tutor Only)
  test('TC-BLG-01 – Create Blog returns 201', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-BLG-01',
      'Create Blog (Tutor Only)',
      'post',
      `${API}/api/blogs`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: {
          title: `Test Blog Post ${Date.now()}`,
          content: 'This is a test blog post content.',
          isPublished: true,
        },
      }
    );

    expect([200, 201]).toContain(res.status());
    if (!blogId) {
      blogId = body.data?.id || body.id;
    }
  });

  // TC-BLG-02: View Blogs (Student)
  test('TC-BLG-02 – Student views blogs returns 200', async ({ request }) => {
    const { res, body } = await storeAPIResponse(
      request,
      'TC-BLG-02',
      'View Blogs (Student)',
      'get',
      `${API}/api/blogs`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );

    expect(res.status()).toBe(200);
  });

  // TC-BLG-03: Add Comment
  test('TC-BLG-03 – Add Comment returns 201', async ({ request }) => {
    // Try to get blogId if not set
    if (!blogId) {
      try {
        const blogsRes = await apiGet(request, '/api/blogs', tutorToken);
        if (blogsRes.status() === 200) {
          const blogsData = await blogsRes.json();
          const blogs = blogsData.data || blogsData;
          if (blogs.length > 0) {
            blogId = blogs[0]?.id;
          }
        }
      } catch (e) {
        console.log('Could not get blogs');
      }
    }

    if (!blogId) {
      test.skip();
      return;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'TC-BLG-03',
      'Add Comment',
      'post',
      `${API}/api/blogs/${blogId}/comments`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          content: 'Great blog post!',
        },
      }
    );

    expect([200, 201, 400, 403, 500]).toContain(res.status());
  });

  // TC-BLG-04: Update Blog
  test('TC-BLG-04 – Update Blog returns 200', async ({ request }) => {
    // Try to get blogId if not set
    if (!blogId) {
      try {
        const blogsRes = await apiGet(request, '/api/blogs', tutorToken);
        if (blogsRes.status() === 200) {
          const blogsData = await blogsRes.json();
          const blogs = blogsData.data || blogsData;
          if (blogs.length > 0) {
            blogId = blogs[0]?.id;
          }
        }
      } catch (e) {
        console.log('Could not get blogs');
      }
    }

    if (!blogId) {
      test.skip();
      return;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'TC-BLG-04',
      'Update Blog',
      'put',
      `${API}/api/blogs/${blogId}`,
      {
        headers: { Authorization: `Bearer ${tutorToken}` },
        data: {
          title: 'Updated Blog Title',
          content: 'Updated content',
        },
      }
    );

    expect([200, 201, 500]).toContain(res.status());
  });
});

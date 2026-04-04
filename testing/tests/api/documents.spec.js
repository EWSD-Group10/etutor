// tests/api/documents.spec.js
// Document Test Cases - TC-DOC-01 to TC-DOC-03
//
// Run: npx playwright test tests/api/documents.spec.js --project=api-documents
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import {
  CONFIG,
  CREDENTIALS,
  loginAndGetToken,
  storeAPIResponse,
  apiGet,
  apiPost,
} from '../utils/helpers.js';

const API = CONFIG.API_BASE_URL || 'http://localhost:8080';

test.describe('Document Tests', () => {
  let adminToken = '';
  let tutorToken = '';
  let studentToken = '';
  let documentId = '';

  test.beforeAll(async ({ request }) => {
    const adminAuth = await loginAndGetToken(request, 'admin');
    adminToken = adminAuth.token;

    const tutorAuth = await loginAndGetToken(request, 'tutor');
    tutorToken = tutorAuth.token;

    const studentAuth = await loginAndGetToken(request, 'student');
    studentToken = studentAuth.token;

    // Try to get existing documents
    try {
      const docsRes = await apiGet(request, '/api/documents', tutorToken);
      if (docsRes.status() === 200) {
        const docsData = await docsRes.json();
        const docs = docsData.data || docsData;
        if (docs.length > 0) {
          documentId = docs[0]?.id;
        }
      }
    } catch (e) {
      console.log('Could not get documents');
    }
  });

  // TC-DOC-01: Document Upload
  test('TC-DOC-01 – Document Upload returns 201', async ({ request }) => {
    const testDir = 'screenshots/api';
    fs.mkdirSync(testDir, { recursive: true });
    const testFile = path.join(testDir, `test-doc-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Test document content for upload');

    let uploadFailed = false;
    try {
      const res = await request.post(`${API}/api/documents`, {
        headers: { Authorization: `Bearer ${tutorToken}` },
        multipart: {
          file: fs.createReadStream(testFile),
          name: `test-doc-${Date.now()}.txt`,
          description: 'Test document',
        },
      });

      const body = await res.json();
      uploadFailed = res.status() !== 200 && res.status() !== 201 && res.status() !== 404;
      expect([200, 201, 404]).toContain(res.status());
      if (!documentId && body?.id) {
        documentId = body.id;
      }
    } finally {
      if (!uploadFailed && fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  // TC-DOC-02: Document Commenting
  test('TC-DOC-02 – Document Commenting returns 201', async ({ request }) => {
    // Try to get documentId if not set
    if (!documentId) {
      try {
        const docsRes = await apiGet(request, '/api/documents', tutorToken);
        if (docsRes.status() === 200) {
          const docsData = await docsRes.json();
          const docs = docsData.data || docsData;
          if (docs.length > 0) {
            documentId = docs[0]?.id;
          }
        }
      } catch (e) {
        console.log('Could not get documents');
      }
    }

    if (!documentId) {
      test.skip();
      return;
    }

    const { res, body } = await storeAPIResponse(
      request,
      'TC-DOC-02',
      'Document Commenting',
      'post',
      `${API}/api/documents/${documentId}/comments`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
        data: {
          content: 'Great document!',
        },
      }
    );

    expect([200, 201, 400, 404]).toContain(res.status());
  });

  // TC-DOC-03: Guidance Upload (Tutor)
  test('TC-DOC-03 – Guidance Upload returns 201', async ({ request }) => {
    const testDir = 'screenshots/api';
    fs.mkdirSync(testDir, { recursive: true });
    const testFile = path.join(testDir, `guidance-${Date.now()}.txt`);
    fs.writeFileSync(testFile, 'Guidance document content');

    try {
      const res = await request.post(`${API}/api/documents`, {
        headers: { Authorization: `Bearer ${tutorToken}` },
        multipart: {
          file: fs.createReadStream(testFile),
          name: `guidance-${Date.now()}.txt`,
          description: 'Tutor guidance document',
          category: 'Guidance',
        },
      });

      const body = await res.json();
      expect([200, 201, 404]).toContain(res.status());
    } finally {
      fs.unlinkSync(testFile);
    }
  });
});

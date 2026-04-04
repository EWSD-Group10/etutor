// tests/utils/test-data.js
// Test data factories for generating realistic test data

import { generateTestData } from './helpers.js';

// ── User Data Factories ───────────────────────────────────────────────────────

export function createAdminData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  return {
    name: `Admin User ${random}`,
    email: `admin_${timestamp}@test.com`,
    password: 'TestAdmin123!',
    role: 'ADMIN',
    ...overrides,
  };
}

export function createStudentData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  const degreePrograms = [
    'BSc Computer Science',
    'BSc Information Technology',
    'BSc Software Engineering',
    'BSc Data Science',
    'MSc Computer Science',
  ];
  
  return {
    name: `Student ${random}`,
    email: `student_${timestamp}@test.com`,
    degreeProgram: degreePrograms[Math.floor(Math.random() * degreePrograms.length)],
    studentId: `STU${timestamp.toString().slice(-6)}`,
    ...overrides,
  };
}

export function createTutorData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  const departments = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Data Science',
    'Mathematics',
    'Engineering',
  ];
  
  return {
    name: `Tutor ${random}`,
    email: `tutor_${timestamp}@test.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    title: ['Dr.', 'Prof.', 'Mr.', 'Ms.'][Math.floor(Math.random() * 4)],
    ...overrides,
  };
}

// ── Content Data Factories ────────────────────────────────────────────────────

export function createBlogData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  const categories = ['Tutorial', 'Announcement', 'Research', 'Tips', 'News'];
  
  return {
    title: `Blog Post: ${random}`,
    content: `
# Test Blog Post ${random}

This is a comprehensive test blog post created on ${new Date().toISOString()}.

## Introduction
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

## Main Content
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

### Key Points
1. First important point about testing
2. Second point about automation
3. Third point about quality assurance

## Conclusion
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

---
*Created for testing purposes*
    `.trim(),
    category: categories[Math.floor(Math.random() * categories.length)],
    isPublished: true,
    ...overrides,
  };
}

export function createMessageData(receiverId, overrides = {}) {
  const { timestamp, random } = generateTestData();
  const messageTypes = ['text', 'file', 'link'];
  
  return {
    receiverId,
    content: `Test message ${random} - This is a test message sent at ${new Date().toISOString()}. It contains some sample text for testing the messaging functionality.`,
    type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
    ...overrides,
  };
}

export function createMeetingData(studentId, overrides = {}) {
  const { timestamp, random } = generateTestData();
  const meetingTypes = ['online', 'in-person', 'hybrid'];
  const futureDate = new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000); // Random date within 14 days
  
  // Set to working hours (9 AM - 5 PM)
  futureDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);
  
  const meetingType = meetingTypes[Math.floor(Math.random() * meetingTypes.length)];
  
  return {
    studentId,
    title: `Meeting: ${random}`,
    description: `This is a test meeting scheduled for testing purposes. Meeting ID: ${random}`,
    scheduledAt: futureDate.toISOString(),
    duration: [30, 45, 60, 90, 120][Math.floor(Math.random() * 5)],
    type: meetingType,
    location: meetingType === 'in-person' ? `Room ${Math.floor(Math.random() * 100) + 100}` : null,
    meetingLink: meetingType === 'online' ? `https://meet.test.com/${random}` : null,
    ...overrides,
  };
}

export function createDocumentData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  const documentTypes = ['pdf', 'docx', 'pptx', 'xlsx', 'txt'];
  const categories = ['Assignment', 'Lecture Notes', 'Research Paper', 'Tutorial', 'Project'];
  
  return {
    name: `Document_${random}.${documentTypes[Math.floor(Math.random() * documentTypes.length)]}`,
    description: `Test document created at ${new Date().toISOString()}. This document is for testing purposes only.`,
    category: categories[Math.floor(Math.random() * categories.length)],
    tags: ['test', 'automated', 'documentation'],
    ...overrides,
  };
}

// ── Allocation Data Factories ─────────────────────────────────────────────────

export function createAllocationData(studentId, tutorId, overrides = {}) {
  const { random } = generateTestData();
  const reasons = [
    'Initial allocation',
    'Academic guidance',
    'Project supervision',
    'Thesis mentoring',
    'Research collaboration',
  ];
  
  return {
    studentId,
    tutorId,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    notes: `Allocation notes for test ${random}`,
    priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    ...overrides,
  };
}

export function createBulkAllocationData(tutorId, studentIds, overrides = {}) {
  const { random } = generateTestData();
  
  return {
    tutorId,
    studentIds,
    reason: `Bulk allocation ${random}`,
    notes: `Bulk allocation for ${studentIds.length} students`,
    ...overrides,
  };
}

// ── Comment Data Factories ────────────────────────────────────────────────────

export function createCommentData(overrides = {}) {
  const { timestamp, random } = generateTestData();
  
  return {
    content: `Test comment ${random} - This is a test comment created at ${new Date().toISOString()}.`,
    ...overrides,
  };
}

// ── Bulk Data Generators ──────────────────────────────────────────────────────

export function generateMultipleStudents(count = 5) {
  const students = [];
  for (let i = 0; i < count; i++) {
    students.push(createStudentData({
      name: `Bulk Student ${i + 1}`,
    }));
  }
  return students;
}

export function generateMultipleTutors(count = 3) {
  const tutors = [];
  for (let i = 0; i < count; i++) {
    tutors.push(createTutorData({
      name: `Bulk Tutor ${i + 1}`,
    }));
  }
  return tutors;
}

export function generateMultipleBlogs(count = 5) {
  const blogs = [];
  for (let i = 0; i < count; i++) {
    blogs.push(createBlogData({
      title: `Bulk Blog Post ${i + 1}`,
    }));
  }
  return blogs;
}

// ── Edge Case Data ────────────────────────────────────────────────────────────

export const EDGE_CASES = {
  // Empty/missing values
  emptyString: '',
  nullValue: null,
  undefinedValue: undefined,
  emptyObject: {},
  emptyArray: [],
  
  // Invalid formats
  invalidEmail: 'not-an-email',
  invalidDate: 'not-a-date',
  invalidUUID: 'not-a-uuid',
  
  // Long strings
  longString: 'a'.repeat(10000),
  veryLongString: 'x'.repeat(100000),
  
  // Special characters
  specialCharacters: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  sqlInjection: "'; DROP TABLE users; --",
  xssScript: '<script>alert("XSS")</script>',
  
  // Unicode
  unicodeString: 'こんにちは 🌍 Привет مرحبا',
  emojiString: '😀🎉🚀💻🌟',
  
  // Numbers
  zero: 0,
  negativeNumber: -1,
  largeNumber: 999999999,
  floatNumber: 3.14159,
};

// ── Test Scenarios ────────────────────────────────────────────────────────────

export const TEST_SCENARIOS = {
  // Authentication scenarios
  validLogin: {
    email: 'admin1@etutor.com',
    password: 'admin123',
    expectSuccess: true,
  },
  invalidPassword: {
    email: 'admin1@etutor.com',
    password: 'wrongpassword',
    expectSuccess: false,
    expectedStatus: 401,
  },
  nonExistentUser: {
    email: 'nonexistent@test.com',
    password: 'anypassword',
    expectSuccess: false,
    expectedStatus: 401,
  },
  
  // CRUD scenarios
  createAndDelete: {
    steps: ['create', 'read', 'update', 'delete'],
    verifyCleanup: true,
  },
  bulkCreate: {
    count: 10,
    verifyAllCreated: true,
  },
  
  // Permission scenarios
  roleBasedAccess: {
    admin: ['create', 'read', 'update', 'delete'],
    tutor: ['read', 'update'],
    student: ['read'],
  },
};

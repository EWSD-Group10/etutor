# eTutor Integration Test Cases

## Test Plan Overview

**Project:** eTutor Platform  
**Version:** 1.0.0  
**Test Type:** Integration Testing (Student Project)  
**Test Environment:** Development/Staging  
**Database:** PostgreSQL (test database)  
**API Base URL:** `http://localhost:8080`  
**Note:** This test plan is simplified for educational purposes, focusing on core functionality without performance testing or advanced edge cases.

## Test Objectives

1. Verify all API endpoints work as per specifications
2. Validate request/response formats and status codes
3. Test authentication and authorization flows
4. Ensure data persistence and relationships work correctly
5. Verify error handling and validation

## Test Cases

### 1. Authentication API

| Test Case ID | Category | Test Case Description | Preconditions | Test Steps | Input/Action | Expected Outcome | Priority |
|--------------|----------|----------------------|---------------|------------|--------------|------------------|----------|
| TC-AUTH-001 | Positive | Valid Login | 1. Active user exists in database<br>2. User has valid credentials | 1. Send POST request to `/api/login`<br>2. Verify response status and token | `{ "email": "student@example.com", "password": "password123" }` | 200 OK<br>Response contains `accessToken`<br>User object with id, email, name, role<br>Refresh token cookie set | High |
| TC-AUTH-002 | Positive | Refresh Token | 1. Valid refresh token cookie exists | 1. Send POST request to `/api/refresh` with refresh token cookie<br>2. Verify new access token | Cookie: `refreshToken=valid_token` | 200 OK<br>Response contains new `accessToken`<br>New refresh token cookie set | High |
| TC-AUTH-003 | Positive | Get Current User | 1. Valid access token in Authorization header<br>2. User exists | 1. Send GET request to `/api/current-user` with Bearer token<br>2. Verify user details | Header: `Authorization: Bearer valid_token` | 200 OK<br>Response contains user details with role in uppercase<br>Includes degreeProgram, department, isActive, createdAt | Medium |
| TC-AUTH-004 | Negative | Invalid Login Credentials | 1. User exists but wrong password | 1. Send POST request with incorrect password<br>2. Verify error response | `{ "email": "student@example.com", "password": "wrongpassword" }` | 401 Unauthorized<br>Error: "Invalid email or password" | High |
| TC-AUTH-005 | Negative | Missing Login Fields | - | 1. Send POST request with missing email or password<br>2. Verify validation error | `{ "email": "", "password": "" }` | 400 Bad Request<br>Error: "Email and password are required" | Medium |
| TC-AUTH-006 | Negative | Invalid Email Format | - | 1. Send POST request with invalid email format<br>2. Verify validation error | `{ "email": "invalid-email", "password": "password123" }` | 400 Bad Request<br>Validation error for email format | Low |
| TC-AUTH-007 | Edge | Expired Refresh Token | 1. Expired refresh token cookie | 1. Send POST request with expired token<br>2. Verify error response | Cookie: `refreshToken=expired_token` | 401 Unauthorized<br>Error: "Invalid or expired refresh token" | Medium |
| TC-AUTH-008 | Edge | Missing Authorization Header | - | 1. Send GET request to `/api/current-user` without token<br>2. Verify authentication error | No Authorization header | 401 Unauthorized<br>Error: "Unauthorized" | Medium |
| TC-AUTH-009 | Positive | Logout | 1. Valid access token | 1. Send POST request to `/api/logout` with Bearer token<br>2. Verify cookie cleared | Header: `Authorization: Bearer valid_token` | 200 OK<br>Message: "Logged out successfully"<br>Refresh token cookie cleared | Medium |

### 2. Students API

| Test Case ID | Category | Test Case Description | Preconditions | Test Steps | Input/Action | Expected Outcome | Priority |
|--------------|----------|----------------------|---------------|------------|--------------|------------------|----------|
| TC-STU-001 | Positive | Create Student | 1. Admin user authenticated<br>2. Unique email not in use | 1. Send POST request to `/api/students` with valid data<br>2. Verify student created | `{ "email": "newstudent@example.com", "name": "John Doe", "degreeProgram": "Computer Science" }` | 201 Created<br>Response contains student data with id, email, name, role: "STUDENT"<br>Default password set (123456) | High |
| TC-STU-002 | Positive | Read Student | 1. Admin user authenticated<br>2. Student exists with known ID | 1. Send GET request to `/api/students/{id}`<br>2. Verify student details | URL: `/api/students/{valid_uuid}` | 200 OK<br>Response contains student details<br>Includes all selected fields | High |
| TC-STU-003 | Positive | Update Student | 1. Admin user authenticated<br>2. Student exists with known ID | 1. Send PUT request to `/api/students/{id}` with update data<br>2. Verify student updated | URL: `/api/students/{valid_uuid}`<br>Body: `{ "name": "Jane Doe", "degreeProgram": "Mathematics" }` | 200 OK<br>Response contains updated student data<br>Name and degreeProgram updated | High |
| TC-STU-004 | Positive | Delete Student | 1. Admin user authenticated<br>2. Student exists with known ID | 1. Send DELETE request to `/api/students/{id}`<br>2. Verify student soft-deleted | URL: `/api/students/{valid_uuid}` | 200 OK<br>Response confirms deletion<br>Student marked as inactive (soft delete) | High |
| TC-STU-005 | Positive | List Students | 1. Admin user authenticated<br>2. Multiple students exist | 1. Send GET request to `/api/students` with pagination<br>2. Verify paginated response | Query: `?page=1&limit=10&search=john` | 200 OK<br>Response contains `data` array and `pagination` object<br>Pagination includes page, limit, total, totalPages | Medium |
| TC-STU-006 | Positive | List Unassigned Students | 1. Admin user authenticated<br>2. Some students have no allocations | 1. Send GET request to `/api/students/unassigned`<br>2. Verify only unassigned students returned | Query: `?page=1&limit=10` | 200 OK<br>Only students with no allocations returned<br>Pagination included | Medium |
| TC-STU-007 | Positive | List Assigned Students | 1. Admin user authenticated<br>2. Some students have allocations | 1. Send GET request to `/api/students/assigned`<br>2. Verify only assigned students returned | Query: `?page=1&limit=10` | 200 OK<br>Only students with allocations returned<br>Pagination included | Medium |
| TC-STU-008 | Negative | Create Student Missing Fields | 1. Admin user authenticated | 1. Send POST request with missing required fields<br>2. Verify validation errors | `{ "email": "", "name": "" }` | 400 Bad Request<br>Errors array: ["Email is required", "Name is required"] | High |
| TC-STU-009 | Negative | Create Student Duplicate Email | 1. Admin user authenticated<br>2. Email already exists | 1. Send POST request with existing email<br>2. Verify conflict error | `{ "email": "existing@example.com", "name": "Test" }` | 409 Conflict<br>Error: "Email already exists" | High |
| TC-STU-010 | Negative | Update Student Invalid ID Format | 1. Admin user authenticated | 1. Send PUT request with invalid UUID format<br>2. Verify validation error | URL: `/api/students/invalid-id` | 400 Bad Request<br>Error: "Invalid student ID format" | Medium |
| TC-STU-011 | Negative | Update Student Not Found | 1. Admin user authenticated<br>2. Student ID does not exist | 1. Send PUT request with non-existent ID<br>2. Verify 404 error | URL: `/api/students/{non_existent_uuid}` | 404 Not Found<br>Error: "Student not found" | Medium |
| TC-STU-012 | Edge | Create Student Invalid Email | 1. Admin user authenticated | 1. Send POST request with invalid email format<br>2. Verify validation error | `{ "email": "notanemail", "name": "Test" }` | 400 Bad Request<br>Error: "Invalid email format" | Medium |
| TC-STU-013 | Edge | Update Student Same Email | 1. Admin user authenticated<br>2. Student exists | 1. Send PUT request with same email<br>2. Verify success (no conflict) | URL: `/api/students/{valid_uuid}`<br>Body: `{ "email": "same@example.com" }` (same as existing) | 200 OK<br>Student updated without conflict | Low |
| TC-STU-014 | Positive | Student Dashboard | 1. Student user authenticated<br>2. Student has allocations | 1. Send GET request to `/api/students/me/dashboard`<br>2. Verify dashboard data | Header: `Authorization: Bearer student_token` | 200 OK<br>Dashboard data with tutor info, recent meetings, messages | Medium |

### 3. Tutors API

| Test Case ID | Category | Test Case Description | Preconditions | Test Steps | Input/Action | Expected Outcome | Priority |
|--------------|----------|----------------------|---------------|------------|--------------|------------------|----------|
| TC-TUT-001 | Positive | Create Tutor | 1. Admin user authenticated<br>2. Unique email not in use | 1. Send POST request to `/api/tutors` with valid data<br>2. Verify tutor created | `{ "email": "newtutor@example.com", "name": "Dr. Smith", "department": "Computer Science" }` | 201 Created<br>Response contains tutor data with id, email, name, role: "TUTOR"<br>Default password set (123456) | High |
| TC-TUT-002 | Positive | Read Tutor | 1. Admin user authenticated<br>2. Tutor exists with known ID | 1. Send GET request to `/api/tutors/{id}`<br>2. Verify tutor details | URL: `/api/tutors/{valid_uuid}` | 200 OK<br>Response contains tutor details | High |
| TC-TUT-003 | Positive | Update Tutor | 1. Admin user authenticated<br>2. Tutor exists with known ID | 1. Send PUT request to `/api/tutors/{id}` with update data<br>2. Verify tutor updated | URL: `/api/tutors/{valid_uuid}`<br>Body: `{ "name": "Dr. Jane Smith", "department": "Mathematics" }` | 200 OK<br>Response contains updated tutor data | High |
| TC-TUT-004 | Positive | Delete Tutor | 1. Admin user authenticated<br>2. Tutor exists with known ID<br>3. Tutor has no active allocations | 1. Send DELETE request to `/api/tutors/{id}`<br>2. Verify tutor soft-deleted | URL: `/api/tutors/{valid_uuid}` | 200 OK<br>Response confirms deletion<br>Tutor marked as inactive | High |
| TC-TUT-005 | Positive | List Tutors | 1. Admin user authenticated<br>2. Multiple tutors exist | 1. Send GET request to `/api/tutors` with pagination<br>2. Verify paginated response | Query: `?page=1&limit=10&search=smith` | 200 OK<br>Response contains `data` array and `pagination` object | Medium |
| TC-TUT-006 | Positive | Tutor Dashboard | 1. Tutor user authenticated<br>2. Tutor has allocated students | 1. Send GET request to `/api/tutors/me/dashboard`<br>2. Verify dashboard data | Header: `Authorization: Bearer tutor_token` | 200 OK<br>Dashboard data with student counts, recent activities | Medium |
| TC-TUT-007 | Positive | Tutor My Students | 1. Tutor user authenticated<br>2. Tutor has allocated students | 1. Send GET request to `/api/tutors/me/students`<br>2. Verify list of allocated students | Header: `Authorization: Bearer tutor_token` | 200 OK<br>List of students allocated to this tutor | Medium |
| TC-TUT-008 | Negative | Create Tutor Missing Fields | 1. Admin user authenticated | 1. Send POST request with missing required fields<br>2. Verify validation errors | `{ "email": "", "name": "" }` | 400 Bad Request<br>Validation errors for required fields | High |
| TC-TUT-009 | Negative | Create Tutor Duplicate Email | 1. Admin user authenticated<br>2. Email already exists | 1. Send POST request with existing email<br>2. Verify conflict error | `{ "email": "existing@example.com", "name": "Test" }` | 409 Conflict<br>Error: "Email already exists" | High |
| TC-TUT-010 | Negative | Delete Tutor With Allocations | 1. Admin user authenticated<br>2. Tutor has active allocations | 1. Send DELETE request<br>2. Verify deletion prevented or handled | URL: `/api/tutors/{tutor_with_allocations}` | 400 Bad Request or cascading delete handled appropriately | Medium |
| TC-TUT-011 | Edge | Update Tutor Same Email | 1. Admin user authenticated<br>2. Tutor exists | 1. Send PUT request with same email<br>2. Verify success | URL: `/api/tutors/{valid_uuid}`<br>Body: `{ "email": "same@example.com" }` | 200 OK<br>Tutor updated without conflict | Low |

### 4. Allocations API

| Test Case ID | Category | Test Case Description | Preconditions | Test Steps | Input/Action | Expected Outcome | Priority |
|--------------|----------|----------------------|---------------|------------|--------------|------------------|----------|
| TC-ALLOC-001 | Positive | Create Allocation | 1. Admin user authenticated<br>2. Student exists and is unassigned<br>3. Tutor exists and is active | 1. Send POST request to `/api/allocations` with student/tutor mapping<br>2. Verify allocation created | `{ "studentId": "student_uuid", "tutorId": "tutor_uuid", "notes": "Initial allocation" }` | 201 Created<br>Response contains allocation data with id, studentId, tutorId, allocatedAt | High |
| TC-ALLOC-002 | Positive | Read Allocation | 1. Admin user authenticated<br>2. Allocation exists with known ID | 1. Send GET request to `/api/allocations/{id}`<br>2. Verify allocation details | URL: `/api/allocations/{valid_uuid}` | 200 OK<br>Response includes allocation with student and tutor details (nested) | High |
| TC-ALLOC-003 | Positive | Update Allocation | 1. Admin user authenticated<br>2. Allocation exists with known ID | 1. Send PUT request to `/api/allocations/{id}` with update data<br>2. Verify allocation updated | URL: `/api/allocations/{valid_uuid}`<br>Body: `{ "notes": "Updated notes", "reason": "Student request" }` | 200 OK<br>Response contains updated allocation data | High |
| TC-ALLOC-004 | Positive | Delete Allocation | 1. Admin user authenticated<br>2. Allocation exists with known ID | 1. Send DELETE request to `/api/allocations/{id}`<br>2. Verify allocation deleted | URL: `/api/allocations/{valid_uuid}` | 200 OK<br>Response confirms deletion<br>Student becomes unassigned | High |
| TC-ALLOC-005 | Positive | Bulk Create Allocations | 1. Admin user authenticated<br>2. Multiple students unassigned<br>3. Tutor exists | 1. Send POST request to `/api/allocations/bulk` with array of mappings<br>2. Verify all allocations created | `{ "allocations": [ { "studentId": "s1", "tutorId": "t1" }, { "studentId": "s2", "tutorId": "t1" } ] }` | 201 Created<br>Response contains array of created allocations<br>Count matches input | High |
| TC-ALLOC-006 | Positive | List Allocations | 1. Admin user authenticated<br>2. Multiple allocations exist | 1. Send GET request to `/api/allocations` with pagination<br>2. Verify paginated response | Query: `?page=1&limit=10` | 200 OK<br>Response contains `data` array with nested student/tutor details<br>Pagination included | Medium |
| TC-ALLOC-007 | Positive | Allocation Statistics | 1. Admin user authenticated<br>2. Allocations exist | 1. Send GET request to `/api/allocations/stats`<br>2. Verify statistics returned | Query: None | 200 OK<br>Statistics like total allocations, allocations per tutor, etc. | Medium |
| TC-ALLOC-008 | Negative | Create Allocation Duplicate Student | 1. Admin user authenticated<br>2. Student already has an allocation | 1. Send POST request with student already allocated<br>2. Verify conflict error | `{ "studentId": "already_allocated_student", "tutorId": "tutor_uuid" }` | 409 Conflict<br>Error: "Student already has an allocation" | High |
| TC-ALLOC-009 | Negative | Create Allocation Invalid Student ID | 1. Admin user authenticated<br>2. Student ID does not exist | 1. Send POST request with non-existent student ID<br>2. Verify error | `{ "studentId": "non_existent_uuid", "tutorId": "tutor_uuid" }` | 404 Not Found or 400 Bad Request<br>Error: "Student not found" | High |
| TC-ALLOC-010 | Negative | Create Allocation Invalid Tutor ID | 1. Admin user authenticated<br>2. Tutor ID does not exist | 1. Send POST request with non-existent tutor ID<br>2. Verify error | `{ "studentId": "student_uuid", "tutorId": "non_existent_uuid" }` | 404 Not Found or 400 Bad Request<br>Error: "Tutor not found" | High |
| TC-ALLOC-011 | Negative | Bulk Create Empty Array | 1. Admin user authenticated | 1. Send POST request with empty allocations array<br>2. Verify validation error | `{ "allocations": [] }` | 400 Bad Request<br>Error: "Allocations array cannot be empty" | Medium |
| TC-ALLOC-012 | Negative | Bulk Create Partial Invalid | 1. Admin user authenticated<br>2. Some student IDs invalid | 1. Send POST request with mix of valid/invalid data<br>2. Verify partial success or error | `{ "allocations": [ { "studentId": "valid", "tutorId": "tutor" }, { "studentId": "invalid", "tutorId": "tutor" } ] }` | 400 Bad Request<br>Error details for invalid entries | Medium |
| TC-ALLOC-013 | Edge | Reallocate Student | 1. Admin user authenticated<br>2. Student already allocated to Tutor A | 1. Create new allocation for same student to Tutor B<br>2. Verify reallocation (may update existing or create new) | `{ "studentId": "allocated_student", "tutorId": "new_tutor_uuid", "reason": "Student request" }` | 201 Created or 200 OK<br>Allocation updated with reallocation info (reallocatedBy, reason) | Medium |
| TC-ALLOC-014 | Edge | Update Allocation Notes Only | 1. Admin user authenticated<br>2. Allocation exists | 1. Send PUT request with only notes field<br>2. Verify partial update | URL: `/api/allocations/{valid_uuid}`<br>Body: `{ "notes": "Just a note update" }` | 200 OK<br>Only notes updated, other fields unchanged | Low |

## Test Data Requirements

### Required Test Users
1. **Admin User**
   - Email: `admin@etutor.com`
   - Password: `admin123`
   - Role: `admin`

2. **Tutor User**
   - Email: `tutor@etutor.com`
   - Password: `tutor123`
   - Role: `tutor`

3. **Student User**
   - Email: `student@etutor.com`
   - Password: `student123`
   - Role: `student`

### Test Environment Setup
1. Database seeded with test data
2. Server running on test port
3. Test database isolated from development
4. Clean data before each test suite (optional)

## Test Execution Notes

### Authentication for Tests
- For admin-only endpoints, include admin JWT token
- For tutor-specific endpoints, include tutor JWT token
- For student-specific endpoints, include student JWT token
- Use refresh token for token refresh tests

### Test Sequence
1. Run Auth API tests first to obtain tokens
2. Use obtained tokens for subsequent tests
3. Clean up created test data after test run (optional)

### Error Handling Tests
- Verify appropriate HTTP status codes
- Verify error response format consistency
- Verify validation messages are user-friendly

## Test Results Template

| Test Case ID | Execution Date | Tester | Actual Outcome | Status (Pass/Fail) | Notes |
|--------------|----------------|--------|----------------|-------------------|-------|
| TC-AUTH-001 | | | | | |
| TC-AUTH-002 | | | | | |
| ... | | | | | |

## Simplified for Student Project

This integration test plan focuses on core functionality and essential test cases suitable for a student project. Performance testing and advanced edge case scenarios have been omitted for simplicity.

## Appendix

### API Response Formats
- Success: `{ "data": ... }` or `{ "accessToken": ... }`
- Error: `{ "error": "..." }` or `{ "errors": [...] }`
- Pagination: `{ "data": [...], "pagination": { "page", "limit", "total", "totalPages" } }`

### HTTP Status Codes Used
- 200 OK - Successful GET, PUT, DELETE
- 201 Created - Successful POST (creation)
- 400 Bad Request - Validation errors
- 401 Unauthorized - Authentication required or failed
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 409 Conflict - Resource conflict (duplicate)
- 500 Internal Server Error - Server error
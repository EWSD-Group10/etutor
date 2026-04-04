# eTutor System Test Cases

## Test Execution Summary

| Date | Environment | Tester | Result |
|------|-------------|--------|--------|
| 2026-03-29 | Local (Docker) | Automated | 28/28 Passed |

---

## 1. Authentication Module

### TC-AUTH-01: Valid Login Returns JWT Token
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-01 |
| **Title** | Valid Login Returns JWT Token |
| **Category** | Functional |
| **Preconditions** | Backend running, database seeded with test users |
| **Steps** | 1. Send POST request to `/api/login`<br>2. Include valid email and password in body<br>3. Verify response status and content |
| **Expected Result** | Status 200, response contains `accessToken` and `user` object with role |
| **Status** | ✅ Pass |

---

### TC-AUTH-02: Login With Wrong Password Returns 401
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-02 |
| **Title** | Login With Wrong Password Returns 401 |
| **Category** | Functional |
| **Preconditions** | Backend running, valid user exists |
| **Steps** | 1. Send POST request to `/api/login`<br>2. Include valid email but wrong password<br>3. Verify response status |
| **Expected Result** | Status 401, error message "Invalid email or password" |
| **Status** | ✅ Pass |

---

### TC-AUTH-03: Login With Empty Body Returns 400
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-03 |
| **Title** | Login With Empty Body Returns 400 |
| **Category** | Functional |
| **Preconditions** | Backend running |
| **Steps** | 1. Send POST request to `/api/login`<br>2. Include empty JSON body `{}`<br>3. Verify response status |
| **Expected Result** | Status 400, error message about missing credentials |
| **Status** | ✅ Pass |

---

### TC-AUTH-04: Refresh Token Returns New JWT
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-04 |
| **Title** | Refresh Token Returns New JWT |
| **Category** | Functional |
| **Preconditions** | User logged in, valid session cookie |
| **Steps** | 1. Login to get session cookie<br>2. Send POST request to `/api/refresh` with cookie<br>3. Verify new token is returned |
| **Expected Result** | Status 200, new `accessToken` in response |
| **Status** | ✅ Pass |

---

### TC-AUTH-05: Refresh Without Cookie Returns 401
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-05 |
| **Title** | Refresh Without Cookie Returns 401 |
| **Category** | Functional |
| **Preconditions** | Backend running |
| **Steps** | 1. Send POST request to `/api/refresh` without cookie<br>2. Verify response status |
| **Expected Result** | Status 401, error "No refresh token provided" |
| **Status** | ✅ Pass |

---

### TC-AUTH-06: Get Current User Returns User Details
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-06 |
| **Title** | Get Current User Returns User Details |
| **Category** | Functional |
| **Preconditions** | User logged in with valid access token |
| **Steps** | 1. Send GET request to `/api/current-user`<br>2. Include Bearer token in Authorization header<br>3. Verify response contains user data |
| **Expected Result** | Status 200, response contains `user` object with email, name, role |
| **Status** | ✅ Pass |

---

### TC-AUTH-07: Access Without Token Returns 401
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-07 |
| **Title** | Access Without Token Returns 401 |
| **Category** | Functional |
| **Preconditions** | Backend running |
| **Steps** | 1. Send GET request to `/api/current-user`<br>2. No Authorization header<br>3. Verify response status |
| **Expected Result** | Status 401 |
| **Status** | ✅ Pass |

---

### TC-AUTH-08: UI Valid Login Redirects to Dashboard
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-08 |
| **Title** | UI Valid Login Redirects to Dashboard |
| **Category** | UI Unit |
| **Preconditions** | Frontend running, browser open at login page |
| **Steps** | 1. Navigate to login page<br>2. Enter valid email and password<br>3. Click Login button<br>4. Wait for redirect |
| **Expected Result** | User redirected to `/admin/dashboard`, `/tutor/dashboard`, or `/student/dashboard` based on role |
| **Status** | ✅ Pass |

---

### TC-AUTH-09: UI Wrong Password Shows Error
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-09 |
| **Title** | UI Wrong Password Shows Error Message |
| **Category** | UI Unit |
| **Preconditions** | Frontend running, browser open at login page |
| **Steps** | 1. Navigate to login page<br>2. Enter valid email with wrong password<br>3. Click Login button<br>4. Wait for error message |
| **Expected Result** | Error message displayed, user stays on login page |
| **Status** | ✅ Pass |

---

### TC-AUTH-10: UI Empty Form Shows Validation Error
| Field | Value |
|-------|-------|
| **ID** | TC-AUTH-10 |
| **Title** | UI Empty Form Shows Validation Error |
| **Category** | UI Unit |
| **Preconditions** | Frontend running, browser open at login page |
| **Steps** | 1. Navigate to login page<br>2. Leave email and password empty<br>3. Click Login button |
| **Expected Result** | Validation errors shown, form not submitted |
| **Status** | ✅ Pass |

---

## 2. Students Module (Admin)

### TC-STUD-01: Create Student With Valid Data Returns 201
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-01 |
| **Title** | Create Student With Valid Data Returns 201 |
| **Category** | Functional |
| **Preconditions** | Admin logged in with valid token |
| **Steps** | 1. Send POST to `/api/students`<br>2. Include name, email, degreeProgram<br>3. Verify response |
| **Expected Result** | Status 201, response contains `data` with student `id` |
| **Status** | ✅ Pass |

---

### TC-STUD-02: Create Student With Missing Email Returns 400
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-02 |
| **Title** | Create Student With Missing Email Returns 400 |
| **Category** | Functional |
| **Preconditions** | Admin logged in with valid token |
| **Steps** | 1. Send POST to `/api/students`<br>2. Include name only, no email<br>3. Verify response |
| **Expected Result** | Status 400, validation error about missing email |
| **Status** | ✅ Pass |

---

### TC-STUD-03: Read Student By Valid ID Returns 200
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-03 |
| **Title** | Read Student By Valid ID Returns 200 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, student exists in database |
| **Steps** | 1. Send GET to `/api/students/{id}`<br>2. Include valid student ID<br>3. Verify response |
| **Expected Result** | Status 200, response contains student details |
| **Status** | ✅ Pass |

---

### TC-STUD-04: Update Student Returns 200
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-04 |
| **Title** | Update Student Returns 200 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, student exists |
| **Steps** | 1. Send PUT to `/api/students/{id}`<br>2. Include updated name<br>3. Verify response |
| **Expected Result** | Status 200 |
| **Status** | ✅ Pass |

---

### TC-STUD-05: Get Student With Non-existent ID Returns 404
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-05 |
| **Title** | Get Student With Non-existent ID Returns 404 |
| **Category** | Functional |
| **Preconditions** | Admin logged in |
| **Steps** | 1. Send GET to `/api/students/{invalid-id}`<br>2. Verify response status |
| **Expected Result** | Status 404 or 400 |
| **Status** | ✅ Pass |

---

### TC-STUD-06: Delete Student Returns 200 or 204
| Field | Value |
|-------|-------|
| **ID** | TC-STUD-06 |
| **Title** | Delete Student Returns 200 or 204 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, student exists |
| **Steps** | 1. Send DELETE to `/api/students/{id}`<br>2. Verify response status |
| **Expected Result** | Status 200 or 204 |
| **Status** | ✅ Pass |

---

## 3. Tutors Module (Admin)

### TC-TUT-01: Create Tutor With Valid Data Returns 201
| Field | Value |
|-------|-------|
| **ID** | TC-TUT-01 |
| **Title** | Create Tutor With Valid Data Returns 201 |
| **Category** | Functional |
| **Preconditions** | Admin logged in with valid token |
| **Steps** | 1. Send POST to `/api/tutors`<br>2. Include name, email, department<br>3. Verify response |
| **Expected Result** | Status 201, response contains `data` with tutor `id` |
| **Status** | ✅ Pass |

---

### TC-TUT-02: Create Tutor With Missing Email Returns 400
| Field | Value |
|-------|-------|
| **ID** | TC-TUT-02 |
| **Title** | Create Tutor With Missing Email Returns 400 |
| **Category** | Functional |
| **Preconditions** | Admin logged in |
| **Steps** | 1. Send POST to `/api/tutors`<br>2. Include name only, no email<br>3. Verify response |
| **Expected Result** | Status 400 |
| **Status** | ✅ Pass |

---

### TC-TUT-03: Read Tutor By Valid ID Returns 200
| Field | Value |
|-------|-------|
| **ID** | TC-TUT-03 |
| **Title** | Read Tutor By Valid ID Returns 200 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, tutor exists |
| **Steps** | 1. Send GET to `/api/tutors/{id}`<br>2. Verify response |
| **Expected Result** | Status 200, tutor details returned |
| **Status** | ✅ Pass |

---

### TC-TUT-04: Update Tutor Returns 200
| Field | Value |
|-------|-------|
| **ID** | TC-TUT-04 |
| **Title** | Update Tutor Returns 200 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, tutor exists |
| **Steps** | 1. Send PUT to `/api/tutors/{id}`<br>2. Include updated name<br>3. Verify response |
| **Expected Result** | Status 200 |
| **Status** | ✅ Pass |

---

### TC-TUT-05: Delete Tutor Returns 200 or 204
| Field | Value |
|-------|-------|
| **ID** | TC-TUT-05 |
| **Title** | Delete Tutor Returns 200 or 204 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, tutor exists |
| **Steps** | 1. Send DELETE to `/api/tutors/{id}`<br>2. Verify response |
| **Expected Result** | Status 200 or 204 |
| **Status** | ✅ Pass |

---

## 4. Allocations Module

### TC-ALLOC-01: Create Single Allocation Returns 201
| Field | Value |
|-------|-------|
| **ID** | TC-ALLOC-01 |
| **Title** | Create Single Allocation Returns 201 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, student and tutor exist |
| **Steps** | 1. Send POST to `/api/allocations`<br>2. Include studentId, tutorId, reason<br>3. Verify response |
| **Expected Result** | Status 201, allocation created with ID |
| **Status** | ✅ Pass |

---

### TC-ALLOC-02: Re-allocating Same Student Returns 201 (Upsert)
| Field | Value |
|-------|-------|
| **ID** | TC-ALLOC-02 |
| **Title** | Re-allocating Same Student Returns 201 (Upsert) |
| **Category** | Functional |
| **Preconditions** | Admin logged in, allocation exists for student |
| **Steps** | 1. Send POST to `/api/allocations` with same studentId<br>2. Different tutorId<br>3. Verify response |
| **Expected Result** | Status 201, allocation updated (not duplicate error) |
| **Status** | ✅ Pass |

---

### TC-ALLOC-03: Bulk Create 10+ Allocations Returns 201
| Field | Value |
|-------|-------|
| **ID** | TC-ALLOC-03 |
| **Title** | Bulk Create 10+ Allocations Returns 201 |
| **Category** | Functional |
| **Preconditions** | Admin logged in, 10 students and 1 tutor exist |
| **Steps** | 1. Send POST to `/api/allocations/bulk`<br>2. Include tutorId and array of studentIds<br>3. Verify response |
| **Expected Result** | Status 201, all students allocated to tutor |
| **Status** | ✅ Pass |

---

### TC-ALLOC-04: Full Allocation Lifecycle (CRUD)
| Field | Value |
|-------|-------|
| **ID** | TC-ALLOC-04 |
| **Title** | Full Allocation Lifecycle (CRUD) |
| **Category** | Functional |
| **Preconditions** | Admin logged in, student and tutor exist |
| **Steps** | 1. Create allocation (POST) - expect 201<br>2. Read allocation (GET) - expect 200<br>3. Update allocation (PUT) - expect 200<br>4. Delete allocation (DELETE) - expect 200/204 |
| **Expected Result** | All CRUD operations succeed |
| **Status** | ✅ Pass |

---

## 5. RBAC (Role-Based Access Control)

### TC-RBAC-01: Student Cannot Access Admin Dashboard
| Field | Value |
|-------|-------|
| **ID** | TC-RBAC-01 |
| **Title** | Student Cannot Access Admin Dashboard |
| **Category** | Logic Unit |
| **Preconditions** | Student logged in |
| **Steps** | 1. Login as student<br>2. Navigate to `/admin`<br>3. Verify redirect or access denied |
| **Expected Result** | User redirected away from admin dashboard |
| **Status** | ✅ Pass |

---

### TC-RBAC-02: Tutor Cannot Access Admin Dashboard
| Field | Value |
|-------|-------|
| **ID** | TC-RBAC-02 |
| **Title** | Tutor Cannot Access Admin Dashboard |
| **Category** | Logic Unit |
| **Preconditions** | Tutor logged in |
| **Steps** | 1. Login as tutor<br>2. Navigate to `/admin`<br>3. Verify redirect or access denied |
| **Expected Result** | User redirected away from admin dashboard |
| **Status** | ✅ Pass |

---

### TC-RBAC-03: Admin Can Access Admin Dashboard
| Field | Value |
|-------|-------|
| **ID** | TC-RBAC-03 |
| **Title** | Admin Can Access Admin Dashboard |
| **Category** | UI Unit |
| **Preconditions** | Admin logged in |
| **Steps** | 1. Login as admin<br>2. Navigate to `/admin/dashboard`<br>3. Verify page loads |
| **Expected Result** | Admin dashboard displayed with statistics |
| **Status** | ✅ Pass |

---

## Test Execution Checklist

- [x] All authentication tests pass
- [x] All student CRUD operations work
- [x] All tutor CRUD operations work
- [x] Allocation create/update/delete works
- [x] Bulk allocation works
- [x] RBAC restrictions enforced
- [x] UI login flow works
- [x] UI role redirects work

---

## Appendix: Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@etutor.com | admin123 |
| Tutor | tutor1@etutor.com | tutor123 |
| Student | student1@etutor.com | student123 |

---

## Appendix: API Base URLs

| Environment | Backend | Frontend |
|-------------|---------|----------|
| Local | http://localhost:8080 | http://localhost:3000 |
| Production | https://ewsdapi.cloudlab-hostme.online | https://ewsd10.cloudlab-hostme.online |

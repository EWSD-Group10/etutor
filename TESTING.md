# eTutor Manual Testing Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Test Credentials](#test-credentials)
4. [UI Testing (Browser)](#ui-testing-browser)
5. [API Testing (Postman)](#api-testing-postman)
6. [Test Cases by Module](#test-cases-by-module)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker and Docker Compose installed
- Browser (Chrome/Firefox recommended)
- Postman desktop app or web version
- Backend running on `http://localhost:8080` or your deployed URL
- Frontend running on `http://localhost:3000` or your deployed URL

---

## Environment Setup

### Start Services
```bash
cd /home/ubuntu/etutor/etutor

# Start all services
docker compose up -d

# Or rebuild and start
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f backend
```

### Seed Database (if needed)
```bash
docker compose exec backend npm run seed
```

---

## Test Credentials

### Admin Users
| Email | Password | Role |
|-------|----------|------|
| admin1@etutor.com | admin123 | Admin |
| admin2@etutor.com | admin123 | Admin |

### Tutor Users
| Email | Password | Role |
|-------|----------|------|
| tutor1@etutor.com | tutor123 | Tutor |
| tutor2@etutor.com | tutor123 | Tutor |
| tutor3@etutor.com | tutor123 | Tutor |
| tutor4@etutor.com | tutor123 | Tutor |
| tutor5@etutor.com | tutor123 | Tutor |

### Student Users
| Email | Password | Role |
|-------|----------|------|
| student1@etutor.com | student123 | Student |
| student2@etutor.com | student123 | Student |
| ... (up to student20@etutor.com) | student123 | Student |

---

## UI Testing (Browser)

### 1. Health Check

**Test:** Verify backend is running
```
Open: http://localhost:8080/health
Expected: {"status":"healthy"}
```

### 2. Login Tests

#### TC-LOGIN-001: Admin Login
1. Open `http://localhost:3000` (or your frontend URL)
2. Enter credentials:
   - Email: `admin1@etutor.com`
   - Password: `admin123`
3. Click "Login"

**Expected Result:**
- Redirect to `/admin/dashboard`
- Dashboard shows admin statistics
- User name displayed in header

#### TC-LOGIN-002: Tutor Login
1. Open login page
2. Enter credentials:
   - Email: `tutor1@etutor.com`
   - Password: `tutor123`
3. Click "Login"

**Expected Result:**
- Redirect to `/tutor/dashboard`
- Shows assigned students list

#### TC-LOGIN-003: Student Login
1. Open login page
2. Enter credentials:
   - Email: `student1@etutor.com`
   - Password: `student123`
3. Click "Login"

**Expected Result:**
- Redirect to `/student/dashboard`
- Shows tutor info and recent activity

#### TC-LOGIN-004: Invalid Credentials
1. Open login page
2. Enter invalid credentials:
   - Email: `invalid@test.com`
   - Password: `wrongpassword`
3. Click "Login"

**Expected Result:**
- Error message: "Invalid email or password"
- Stay on login page

#### TC-LOGIN-005: Empty Fields
1. Leave email and password empty
2. Click "Login"

**Expected Result:**
- Validation error messages appear
- Form not submitted

### 3. Admin Dashboard Tests

#### TC-ADMIN-001: View Dashboard Statistics
1. Login as admin
2. Navigate to Dashboard

**Expected:**
- Total students count
- Total tutors count
- Total allocations count
- Recent activity list

#### TC-ADMIN-002: View Students List
1. Login as admin
2. Navigate to Students

**Expected:**
- List of all students
- Search functionality
- Pagination (if applicable)
- Student details (name, email, department)

#### TC-ADMIN-003: View Tutors List
1. Login as admin
2. Navigate to Tutors

**Expected:**
- List of all tutors
- Search functionality
- Tutor details

#### TC-ADMIN-004: View Allocations
1. Login as admin
2. Navigate to Allocations

**Expected:**
- List of student-tutor allocations
- Ability to create new allocation
- Edit/Delete allocation options

### 4. Tutor Dashboard Tests

#### TC-TUTOR-001: View My Students
1. Login as tutor1@etutor.com
2. Navigate to My Students

**Expected:**
- List of assigned students only
- Student contact information

#### TC-TUTOR-002: Send Message
1. Login as tutor
2. Navigate to Messages
3. Select a student
4. Type a message
5. Click Send

**Expected:**
- Message appears in chat
- Student receives notification

#### TC-TUTOR-003: Schedule Meeting
1. Login as tutor
2. Navigate to Meetings
3. Click "Schedule Meeting"
4. Fill in meeting details:
   - Select student
   - Date and time
   - Type (virtual/in-person)
   - Duration
5. Click "Create"

**Expected:**
- Meeting appears in list
- Student gets notified

#### TC-TUTOR-004: Create Blog Post
1. Login as tutor
2. Navigate to Blog
3. Click "Create Post"
4. Enter title and content
5. Click "Publish"

**Expected:**
- Blog post appears in list
- Assigned students can view

### 5. Student Dashboard Tests

#### TC-STUDENT-001: View Dashboard
1. Login as student
2. View dashboard

**Expected:**
- Assigned tutor info
- Recent messages
- Upcoming meetings
- Recent documents

#### TC-STUDENT-002: View Messages
1. Login as student
2. Navigate to Messages

**Expected:**
- Message history with tutor
- Ability to send replies

#### TC-STUDENT-003: View Meetings
1. Login as student
2. Navigate to Meetings

**Expected:**
- List of scheduled meetings
- Meeting details (date, time, link/location)

#### TC-STUDENT-004: Upload Document
1. Login as student
2. Navigate to Documents
3. Click "Upload"
4. Select a file
5. Click "Upload"

**Expected:**
- File appears in list
- Tutor can view the document

#### TC-STUDENT-005: View Blog Posts
1. Login as student
2. Navigate to Blog

**Expected:**
- List of blog posts from tutor
- Can view post details
- Can add comments

### 6. Logout Test

#### TC-LOGOUT-001: User Logout
1. Login as any user
2. Click Logout button

**Expected:**
- Redirect to login page
- Session cleared
- Cannot access dashboard without re-login

---

## API Testing (Postman)

### Postman Collection Setup

#### Create Environment
1. Open Postman
2. Click "Environments" → "Create Environment"
3. Name: `eTutor Local`
4. Add variables:

| Variable | Initial Value | Description |
|----------|---------------|-------------|
| base_url | http://localhost:8080 | API base URL |
| access_token | | JWT token (auto-filled) |
| refresh_token | | Refresh token (auto-filled) |

#### Import Collection
1. Click "Import"
2. Use the OpenAPI file: `openapi.json`
3. Or create manually as shown below

---

### API Test Cases

#### TC-API-001: Health Check

**Request:**
```
GET {{base_url}}/health
```

**Expected Response:**
```json
{
  "status": "healthy"
}
```

**Status Code:** 200

---

#### TC-API-002: Login - Admin

**Request:**
```
POST {{base_url}}/api/login
Content-Type: application/json

{
  "email": "admin1@etutor.com",
  "password": "admin123"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin1@etutor.com",
    "name": "Alice Admin",
    "role": "ADMIN"
  },
  "lastLoginAt": null | "2026-03-29T..."
}
```

**Status Code:** 200

**Post-request Script (save token):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.accessToken);
}
```

---

#### TC-API-003: Login - Tutor

**Request:**
```
POST {{base_url}}/api/login
Content-Type: application/json

{
  "email": "tutor1@etutor.com",
  "password": "tutor123"
}
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "tutor1@etutor.com",
    "name": "Dr. Sarah Chen",
    "role": "TUTOR"
  }
}
```

**Status Code:** 200

---

#### TC-API-004: Login - Student

**Request:**
```
POST {{base_url}}/api/login
Content-Type: application/json

{
  "email": "student1@etutor.com",
  "password": "student123"
}
```

**Status Code:** 200

---

#### TC-API-005: Login - Invalid Credentials

**Request:**
```
POST {{base_url}}/api/login
Content-Type: application/json

{
  "email": "wrong@email.com",
  "password": "wrongpassword"
}
```

**Expected Response:**
```json
{
  "error": "Invalid email or password"
}
```

**Status Code:** 401

---

#### TC-API-006: Get Current User

**Request:**
```
GET {{base_url}}/api/current-user
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
{
  "ok": true,
  "user": {
    "id": "uuid",
    "email": "admin1@etutor.com",
    "name": "Alice Admin",
    "role": "ADMIN",
    "isActive": true,
    "createdAt": "2026-03-29T..."
  }
}
```

**Status Code:** 200

---

#### TC-API-007: Get Admin Dashboard

**Request:**
```
GET {{base_url}}/api/admin/dashboard
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
{
  "totalStudents": 20,
  "totalTutors": 5,
  "totalAllocations": 20,
  "recentActivities": [...]
}
```

**Status Code:** 200
**Required Role:** Admin

---

#### TC-API-008: List All Students (Admin Only)

**Request:**
```
GET {{base_url}}/api/students
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "email": "student1@etutor.com",
    "name": "Liam Johnson",
    "role": "STUDENT",
    "degreeProgram": "BSc Computer Science",
    "isActive": true
  },
  ...
]
```

**Status Code:** 200
**Required Role:** Admin

---

#### TC-API-009: List All Tutors (Admin Only)

**Request:**
```
GET {{base_url}}/api/tutors
Authorization: Bearer {{access_token}}
```

**Status Code:** 200
**Required Role:** Admin

---

#### TC-API-010: List Allocations

**Request:**
```
GET {{base_url}}/api/allocations
Authorization: Bearer {{access_token}}
```

**Status Code:** 200
**Required Role:** Admin

---

#### TC-API-011: Get Tutor Dashboard

**Request:**
```
GET {{base_url}}/api/tutors/me/dashboard
Authorization: Bearer {{access_token}}
```

**Status Code:** 200
**Required Role:** Tutor

---

#### TC-API-012: Get Tutor's Students

**Request:**
```
GET {{base_url}}/api/tutors/me/students
Authorization: Bearer {{access_token}}
```

**Status Code:** 200
**Required Role:** Tutor

---

#### TC-API-013: Get Student Dashboard

**Request:**
```
GET {{base_url}}/api/students/me/dashboard
Authorization: Bearer {{access_token}}
```

**Status Code:** 200
**Required Role:** Student

---

#### TC-API-014: List Messages (Inbox)

**Request:**
```
GET {{base_url}}/api/messages/inbox
Authorization: Bearer {{access_token}}
```

**Status Code:** 200

---

#### TC-API-015: Send Message

**Request:**
```
POST {{base_url}}/api/messages
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "recipientId": "recipient-uuid",
  "content": "Hello, this is a test message"
}
```

**Expected Response:**
```json
{
  "id": "message-uuid",
  "senderId": "sender-uuid",
  "recipientId": "recipient-uuid",
  "content": "Hello, this is a test message",
  "createdAt": "2026-03-29T...",
  "readAt": null
}
```

**Status Code:** 201

---

#### TC-API-016: List Meetings

**Request:**
```
GET {{base_url}}/api/meetings
Authorization: Bearer {{access_token}}
```

**Status Code:** 200

---

#### TC-API-017: Create Meeting

**Request:**
```
POST {{base_url}}/api/meetings
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "studentId": "student-uuid",
  "meetingType": "virtual",
  "scheduledDate": "2026-04-01T10:00:00.000Z",
  "durationMinutes": 30,
  "meetingLink": "https://meet.example.com/room-123"
}
```

**Status Code:** 201

---

#### TC-API-018: List Blogs

**Request:**
```
GET {{base_url}}/api/blogs
Authorization: Bearer {{access_token}}
```

**Status Code:** 200

---

#### TC-API-019: Create Blog Post (Tutor Only)

**Request:**
```
POST {{base_url}}/api/blogs
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "title": "Welcome to the Course",
  "content": "This is the first blog post for the course...",
  "sorting": 1
}
```

**Status Code:** 201
**Required Role:** Tutor

---

#### TC-API-020: List Documents

**Request:**
```
GET {{base_url}}/api/documents
Authorization: Bearer {{access_token}}
```

**Status Code:** 200

---

#### TC-API-021: Upload Document

**Request:**
```
POST {{base_url}}/api/documents
Authorization: Bearer {{access_token}}
Content-Type: multipart/form-data

file: [select file]
```

**Status Code:** 201

---

#### TC-API-022: Refresh Token

**Request:**
```
POST {{base_url}}/api/refresh
```

**Note:** Refresh token is sent as httpOnly cookie automatically.

**Expected Response:**
```json
{
  "accessToken": "new-jwt-token"
}
```

**Status Code:** 200

---

#### TC-API-023: Logout

**Request:**
```
POST {{base_url}}/api/logout
Authorization: Bearer {{access_token}}
```

**Expected Response:**
```json
{
  "message": "Logged out successfully"
}
```

**Status Code:** 200

---

#### TC-API-024: Access Without Token

**Request:**
```
GET {{base_url}}/api/admin/dashboard
(No Authorization header)
```

**Expected Response:**
```json
{
  "error": "Unauthorized"
}
```

**Status Code:** 401

---

#### TC-API-025: Access Restricted Endpoint (Student tries Admin)

1. Login as student and get token
2. Request:
```
GET {{base_url}}/api/admin/dashboard
Authorization: Bearer {{student_access_token}}
```

**Expected Response:**
```json
{
  "error": "Admin access required"
}
```

**Status Code:** 403

---

### Postman Test Scripts

Add these tests to your Postman requests:

#### Login Test Script
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has accessToken", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('accessToken');
    pm.environment.set("access_token", jsonData.accessToken);
});

pm.test("Response has user object", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user');
    pm.expect(jsonData.user).to.have.property('role');
});
```

#### CRUD Test Script
```javascript
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});
```

---

## Test Cases by Module

### Module: Authentication
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| AUTH-001 | Admin login | Admin | Success |
| AUTH-002 | Tutor login | Tutor | Success |
| AUTH-003 | Student login | Student | Success |
| AUTH-004 | Invalid password | Any | 401 Error |
| AUTH-005 | Non-existent email | Any | 401 Error |
| AUTH-006 | Empty credentials | Any | 400 Error |
| AUTH-007 | Token refresh | Any | New token |
| AUTH-008 | Logout | Any | Cookie cleared |
| AUTH-009 | Access without token | Any | 401 Error |
| AUTH-010 | Access with expired token | Any | 401 Error |

### Module: Students (Admin)
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| STUD-001 | List all students | Admin | 200 OK |
| STUD-002 | Get student by ID | Admin | 200 OK |
| STUD-003 | Create student | Admin | 201 Created |
| STUD-004 | Update student | Admin | 200 OK |
| STUD-005 | Delete student | Admin | 200 OK |
| STUD-006 | List unassigned students | Admin | 200 OK |
| STUD-007 | List assigned students | Admin | 200 OK |

### Module: Tutors (Admin)
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| TUT-001 | List all tutors | Admin | 200 OK |
| TUT-002 | Get tutor by ID | Admin | 200 OK |
| TUT-003 | Create tutor | Admin | 201 Created |
| TUT-004 | Update tutor | Admin | 200 OK |
| TUT-005 | Delete tutor | Admin | 200 OK |

### Module: Allocations
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| ALLOC-001 | List allocations | Admin | 200 OK |
| ALLOC-002 | Create allocation | Admin | 201 Created |
| ALLOC-003 | Bulk create allocations | Admin | 201 Created |
| ALLOC-004 | Update allocation | Admin | 200 OK |
| ALLOC-005 | Delete allocation | Admin | 200 OK |
| ALLOC-006 | Get allocation stats | Admin | 200 OK |

### Module: Messages
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| MSG-001 | List inbox | Any | 200 OK |
| MSG-002 | List contacts | Any | 200 OK |
| MSG-003 | List messages | Any | 200 OK |
| MSG-004 | Send message | Any | 201 Created |

### Module: Meetings
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| MEET-001 | List meetings | Any | 200 OK |
| MEET-002 | Create meeting | Any | 201 Created |
| MEET-003 | Update meeting | Any | 200 OK |
| MEET-004 | List all meetings (Admin) | Admin | 200 OK |

### Module: Blogs
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| BLOG-001 | List blogs | Any | 200 OK |
| BLOG-002 | Get blog by ID | Any | 200 OK |
| BLOG-003 | Create blog | Tutor | 201 Created |
| BLOG-004 | Update blog | Tutor | 200 OK |
| BLOG-005 | Delete blog | Tutor | 200 OK |
| BLOG-006 | Add comment | Any | 201 Created |
| BLOG-007 | Get comments | Any | 200 OK |

### Module: Documents
| ID | Test Case | Role | Expected |
|----|-----------|------|----------|
| DOC-001 | List documents | Any | 200 OK |
| DOC-002 | Upload document | Any | 201 Created |
| DOC-003 | Download document | Any | 200 OK |
| DOC-004 | Delete document | Any | 200 OK |

---

## Troubleshooting

### Backend Not Responding
```bash
# Check container status
docker compose ps

# View logs
docker compose logs backend

# Restart backend
docker compose restart backend
```

### 401 Unauthorized Error
1. Check if user exists in database
2. Run seed: `docker compose exec backend npm run seed`
3. Verify credentials are correct

### 502 Bad Gateway
1. Backend container may have crashed
2. Check logs: `docker compose logs backend`
3. Rebuild: `docker compose up -d --build backend`

### CORS Errors
1. Verify CORS_ORIGIN in docker-compose.yaml includes your frontend URL
2. Rebuild backend after changing CORS settings

### Database Connection Issues
```bash
# Check postgres health
docker compose exec postgres pg_isready -U etutor_user -d etutor_db

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
docker compose exec backend npm run seed
```

### Prisma Client Out of Sync
```bash
# Regenerate Prisma client
docker compose exec backend npx prisma generate
docker compose restart backend
```

---

## Quick Test Checklist

- [ ] Backend health check returns 200
- [ ] Database seeded with test users
- [ ] Admin can login and see dashboard
- [ ] Tutor can login and see their students
- [ ] Student can login and see their tutor
- [ ] Messages can be sent and received
- [ ] Meetings can be created
- [ ] Blog posts can be created (tutor)
- [ ] Documents can be uploaded
- [ ] Logout clears session
- [ ] Unauthorized access returns 401
- [ ] Role-based access returns 403 when applicable

---

## API Base URLs

| Environment | URL |
|-------------|-----|
| Local Development | http://localhost:8080 |
| Production | https://ewsdapi.cloudlab-hostme.online |

| Environment | Frontend URL |
|-------------|--------------|
| Local Development | http://localhost:3000 |
| Production | https://ewsd10.cloudlab-hostme.online |

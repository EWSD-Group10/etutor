# eTutor – Playwright Test Suite

Comprehensive automated tests for the eTutor System covering all features.

---

## Folder Structure

```
├── playwright.config.js          # Playwright config (URLs, reporters, projects)
├── package.json
├── auth/                         # Auto-generated login state files (gitignore this)
│   ├── admin.json
│   ├── tutor.json
│   └── student.json
├── screenshots/                  # Auto-generated screenshots
│   ├── api/                      # JSON response snapshots from API tests
│   └── ui/                       # PNG screenshots from UI tests
├── test-results/                 # Test execution results
└── tests/
    ├── auth.setup.js             # Logs in all roles and saves session state
    ├── utils/                    # Shared test utilities
    │   ├── helpers.js            # Common helper functions
    │   └── test-data.js          # Test data factories
    ├── api/                      # API Tests
    │   ├── sprint0-1.spec.js     # Authentication + Students/Tutors/Allocations
    │   ├── messages.spec.js      # Messaging module tests
    │   ├── meetings.spec.js      # Meetings module tests
    │   ├── blogs.spec.js         # Blogs module tests
    │   ├── documents.spec.js     # Documents module tests
    │   ├── admin.spec.js         # Admin dashboard tests
    │   └── integration.spec.js   # Complete workflow tests
    └── ui/                       # UI Tests
        ├── login.spec.js         # Login page + RBAC tests
        └── dashboard.spec.js     # Dashboard navigation tests
```

---

## Setup

### 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

### 2. Configure environment

Ensure the following services are running:
- **Backend API**: `http://localhost:8080`
- **Frontend**: `http://localhost:3000`
- **Database**: PostgreSQL (configured in backend)

### 3. Update URLs (if different)

Open `playwright.config.js` and set your actual URLs if they differ from defaults.

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin1@etutor.com | admin123 |
| Tutor | tutor1@etutor.com | tutor123 |
| Student | student1@etutor.com | student123 |

---

## Running Tests

### Quick Commands

```bash
# Setup authentication (run once before UI tests)
npm run test:setup

# Run all tests
npm test

# Run all API tests
npm run test:api

# Run all UI tests
npm run test:ui

# Run smoke tests (quick validation)
npm run test:smoke

# Run full test suite
npm run test:full
```

### Module-Specific Commands

```bash
# Authentication & Sprint 0+1 tests
npm run test:api:sprint0-1

# Messaging module
npm run test:api:messages

# Meetings module
npm run test:api:meetings

# Blogs module
npm run test:api:blogs

# Documents module
npm run test:api:documents

# Admin dashboard
npm run test:api:admin

# Integration tests
npm run test:api:integration

# UI Login tests
npm run test:ui:login

# UI Dashboard tests
npm run test:ui:dashboard
```

### Reports

```bash
# Open HTML report
npm run report

# Clean screenshots and reports
npm run clean
```

---

## Screenshots

- **API tests** save a `.json` file per test case to `screenshots/api/` showing request/response details.
- **UI tests** save `.png` screenshots at key moments to `screenshots/ui/`.
- The HTML report at `playwright-report/index.html` embeds all screenshots.

---

## Test Coverage

### Sprint 0 – Authentication (TC-AUTH-01 to TC-AUTH-10)
| TC ID | Description | API | UI |
|---|---|---|---|
| TC-AUTH-01 | Valid Login returns JWT | ✓ | ✓ |
| TC-AUTH-02 | Login with wrong password (401) | ✓ | ✓ |
| TC-AUTH-03 | Login with empty body (400) | ✓ | ✓ |
| TC-AUTH-04 | Refresh Token returns new JWT | ✓ | - |
| TC-AUTH-05 | Refresh without cookie (401) | ✓ | - |
| TC-AUTH-06 | Get Current User returns details | ✓ | - |
| TC-AUTH-07 | Get Current User without token (401) | ✓ | - |
| TC-AUTH-08 | UI Valid login redirects | - | ✓ |
| TC-AUTH-09 | UI Wrong password shows error | - | ✓ |
| TC-AUTH-10 | UI Empty form validation | - | ✓ |

### Sprint 1 – Students, Tutors, Allocations
| TC ID | Description | Test File |
|---|---|---|
| TC-STUD-01 to 06 | Student CRUD operations | `api/sprint0-1.spec.js` |
| TC-TUT-01 to 05 | Tutor CRUD operations | `api/sprint0-1.spec.js` |
| TC-ALLOC-01 to 04 | Allocation operations | `api/sprint0-1.spec.js` |

### Sprint 2 – Messaging (TC-MSG-01 to TC-MSG-08)
| TC ID | Description |
|---|---|
| TC-MSG-01 | Send message (Tutor → Student) |
| TC-MSG-02 | Send message (Student → Tutor) |
| TC-MSG-03 | Get inbox messages |
| TC-MSG-04 | Get message contacts |
| TC-MSG-05 | Get messages with specific user |
| TC-MSG-06 | Send without content (400) |
| TC-MSG-07 | Send without auth (401) |
| TC-MSG-08 | Get inbox without auth (401) |

### Sprint 2 – Meetings (TC-MEET-01 to TC-MEET-09)
| TC ID | Description |
|---|---|
| TC-MEET-01 | Create meeting by tutor |
| TC-MEET-02 | Create meeting by student |
| TC-MEET-03 | List meetings for tutor |
| TC-MEET-04 | List meetings for student |
| TC-MEET-05 | Update meeting |
| TC-MEET-06 | Admin list all meetings |
| TC-MEET-07 | Create with past date (400) |
| TC-MEET-08 | Create without auth (401) |
| TC-MEET-09 | Tutor cannot access admin meetings |

### Sprint 2 – Blogs (TC-BLOG-01 to TC-BLOG-12)
| TC ID | Description |
|---|---|
| TC-BLOG-01 | Create blog by tutor |
| TC-BLOG-02 | Create blog by student (403) |
| TC-BLOG-03 | List all blogs |
| TC-BLOG-04 | Get blog by ID |
| TC-BLOG-05 | Update blog by tutor |
| TC-BLOG-06 | Add comment to blog |
| TC-BLOG-07 | Get blog comments |
| TC-BLOG-08 | Get blog group |
| TC-BLOG-09 | Delete blog by tutor |
| TC-BLOG-10 | Get non-existent blog (404) |
| TC-BLOG-11 | Delete by student (403) |
| TC-BLOG-12 | Get blogs without auth (401) |

### Sprint 2 – Documents (TC-DOC-01 to TC-DOC-08)
| TC ID | Description |
|---|---|
| TC-DOC-01 | Upload document by tutor |
| TC-DOC-02 | Upload document by student |
| TC-DOC-03 | List documents |
| TC-DOC-04 | Download document |
| TC-DOC-05 | Delete document |
| TC-DOC-06 | Upload without auth (401) |
| TC-DOC-07 | List without auth (401) |
| TC-DOC-08 | Download non-existent (404) |

### Sprint 2 – Admin Dashboard (TC-ADMIN-01 to TC-ADMIN-11)
| TC ID | Description |
|---|---|
| TC-ADMIN-01 | Get admin dashboard |
| TC-ADMIN-02 | Admin view as student |
| TC-ADMIN-03 | Admin view as tutor |
| TC-ADMIN-04 | Get most active users |
| TC-ADMIN-05 | Get allocation stats |
| TC-ADMIN-06 | Tutor cannot access admin (403) |
| TC-ADMIN-07 | Student cannot access admin (403) |
| TC-ADMIN-08 | Admin without auth (401) |
| TC-ADMIN-09 | View-as with invalid ID (404) |
| TC-ADMIN-10 | Admin-only endpoint |
| TC-ADMIN-11 | Tutor-only endpoint |

### RBAC Tests
| TC ID | Description | Test File |
|---|---|---|
| TC-RBAC-01 | Student cannot access /admin | `ui/login.spec.js` |
| TC-RBAC-02 | Tutor cannot access /admin | `ui/login.spec.js` |
| TC-RBAC-03 | Admin can access /admin | `ui/login.spec.js` |

### Integration Tests
| TC ID | Description |
|---|---|
| TC-INT-01 | Complete student lifecycle |
| TC-INT-02 | Tutor management workflow |
| TC-INT-03 | Allocation and messaging workflow |
| TC-INT-04 | Blog creation and engagement |
| TC-INT-05 | Meeting scheduling workflow |
| TC-INT-06 | Admin dashboard comprehensive view |

---

## Notes

### Prerequisites for Certain Tests
- **Messaging tests**: Require existing allocations between students and tutors
- **Meeting tests**: Require student-tutor allocation
- **Document tests**: File upload functionality requires multer configured

### Test Data
Tests use dynamic data generation with timestamps to avoid conflicts. Each test run creates unique entities.

### Skipping Tests
Some tests may skip gracefully when prerequisites are not met (e.g., no allocation exists for messaging). This is expected behavior.

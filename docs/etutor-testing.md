# eTutor system – Testing plan
**Project:** EWSD eTutor System | **Version:** 1.0 | **Type:** Manual

---

## 1. Introduction

We're using this plan to make sure the eTutor system actually works the way it's supposed to. Our main goal is to catch bugs early so students, tutors, and admins have a smooth, secure experience. We're sticking to manual testing for now, running checks alongside our development sprints to keep things moving.

---

## 2. What we're testing

### 2.1 In-scope

**Admin tools**
- Allocating tutors (one-by-one or in bulk)
- Removing tutor assignments
- Checking AWS SES email triggers
- Admin dashboard access

**Core features**
- Messaging (only between students and their assigned tutors)
- Meeting requests (sending, accepting, and rejecting)
- Document uploads and comments
- Blog posts (CRUD)
- Student and tutor dashboards

**Reporting**
- Message counts from the last 7 days
- Average messages per tutor
- Lists of unallocated students
- Inactivity reports (7 and 28 days)

**Security**
- Role-based access (RBAC)
- JWT login and token rotation
- Refresh tokens (7-day limit)

### 2.2 Out of scope

- Changing MIS data
- Mobile or cross-browser testing
- Load and performance testing
- Deep penetration testing
- Email delivery speed
- Docker performance

---

## 3. How we'll test

We'll test features manually as soon as they're built in each sprint. 

**Our toolkit**
- **GitHub Issues** for tracking bugs
- **Postman** for hitting API endpoints
- **Browser DevTools** for digging into the frontend
- **Manual checks** for basic accessibility

We're keeping testing integrated—if a feature is marked "done," it gets tested immediately.

---

## 4. Testing levels

| Level | What we're checking | Who's doing it |
|---|---|---|
| Functional | Does the feature work as described? | Tester |
| Integration | Does data move correctly between the UI, API, and DB? | Tester |
| System | Do full workflows (like requesting a meeting) work? | Tester |
| Regression | Did we break anything old with our new code? | Tester |
| Security | Are roles and tokens working securely? | Tester |
| Accessibility | Is the site readable and navigable via keyboard? | Tester |

---

## 5. Sprint schedule

Testing should take up about 20–30% of our time each sprint.

**Sprint 0: The basics**
- Database schema and seeders
- Login and RBAC

**Sprint 1: Admin & emails**
- Allocations and unallocations
- Email notification triggers

**Sprint 2: The interaction engine**
- Messaging and meetings
- Blogs and document uploads
- Dashboard filters

**Sprint 3: Reports & final checks**
- Inactivity and message reports
- Final regression testing and accessibility

---

## 6. Risks we're watching

| Risk | Impact | How we're handling it |
|---|---|---|
| Broken allocation logic | Students get assigned to the wrong tutor | Running specific allocation scenarios |
| JWT bugs | Unauthorized access to data | Verifying every role's access strictly |
| Bad report queries | Wrong statistics | Comparing report output against raw DB data |
| Email failures | Users miss important updates | Monitoring AWS SES logs |

---

## 7. When to start and stop

**Start testing when:**
- The dev says it's finished
- Code is on GitHub
- We have test data ready

**Finish testing when:**
- All cases are run
- 90% pass rate (or better)
- No "High" or "Critical" bugs are left
- The Product Owner gives the thumbs up

---

## 8. How bad is the bug?

| Severity | What it means |
|---|---|
| Critical | The system crashed or data is leaking |
| High | A core feature (like allocation) is broken |
| Medium | Something's wrong, but there's a way around it |
| Low | Small UI glitches or typos |

---

## 9. Test cases and log

### Sprint 0 + Sprint 1

| TC ID | Module / Endpoint | Category | Description | Action | Expected Outcome | Result |
|---|---|---|---|---|---|---|
| TC001 | Auth API `/api/login` | Good | Valid Login | POST `/api/login` | 200 OK (Returns JWT) | ✅ Pass |
| TC002 | Auth API `/api/refresh` | Good | Refresh Token | POST `/api/refresh` | 200 OK (Returns new JWT) | ✅ Pass |
| TC003 | Auth API `/api/current-user` | Good | Get Current User | GET `/api/current-user` | 200 OK | ✅ Pass |
| TC004 | Students API `/api/students` | Good | Create Student | POST `/api/students` | 201 Created | ✅ Pass |
| TC005 | Students API `/api/students/{id}` | Good | Read/Update/Delete | GET, PUT, DELETE | 200 OK | ✅ Pass |
| TC006 | Tutors API `/api/tutors` | Good | Create Tutor | POST `/api/tutors` | 201 Created | ✅ Pass |
| TC007 | Tutors API `/api/tutors/{id}` | Good | Read/Update/Delete | GET, PUT, DELETE | 200 OK | ✅ Pass |
| TC008 | Allocations API `/api/allocations` | Good | Create Allocation | POST `/api/allocations` | 201 Created | ✅ Pass |
| TC009 | Allocations API `/api/allocations/bulk` | Good | Bulk Create | POST `/api/allocations/bulk` | 201 Created | ✅ Pass |
| TC010 | Allocations API `/api/allocations/{id}` | Good | Read/Update/Delete | GET, PUT, DELETE | 200 OK | ✅ Pass |

---

### Sprint 2 – Interaction engine

| TC ID | Module | Category | Description | Action | Expected Outcome | Result |
|---|---|---|---|---|---|---|
| TC011 | Messaging | Good | Student messages their tutor | POST message to assigned tutor | Message stored and visible | |
| TC012 | Messaging | Bad | Student messages unassigned tutor | POST message to wrong tutor | 403 Forbidden | |
| TC013 | Messaging | Good | Tutor replies | POST reply to thread | Reply visible to student | |
| TC014 | Messaging | Bad | Unallocated student messages | POST message to any tutor | 403 Forbidden | |
| TC015 | Meetings | Good | Student requests meeting | POST request with details | Meeting shows as "Pending" | |
| TC016 | Meetings | Good | Tutor accepts | Update status to Accepted | Status updated successfully | |
| TC017 | Meetings | Good | Tutor rejects | Update status to Rejected | Status updated successfully | |
| TC018 | Meetings | Bad | Request without allocation | POST request | 403 Forbidden | |
| TC019 | Docs | Good | Upload PDF | POST `.pdf` file | File stored and visible | |
| TC020 | Docs | Good | Upload DOCX | POST `.docx` file | File stored successfully | |
| TC021 | Docs | Bad | Upload .exe | POST `.exe` file | 400 Bad Request | |
| TC022 | Docs | Bad | Upload .bat | POST `.bat` file | 400 Bad Request | |
| TC023 | Comments | Good | Add comment to doc | POST comment text | Comment visible on doc | |
| TC024 | Comments | Good | View comments | GET comments for a doc | Returns all comments | |
| TC025 | Blog | Good | Create post | POST title and content | Post visible in list | |
| TC026 | Blog | Good | Edit own post | PUT updated content | Post updated | |
| TC027 | Blog | Good | Delete own post | DELETE post | Post removed | |
| TC028 | Blog | Bad | Edit someone else's post | PUT on another user's post | 403 Forbidden | |
| TC029 | Blog | Good | View all posts | GET `/blogs` | Returns list of posts | |
| TC030 | Dashboard | Good | Student dashboard summary | Check dashboard view | Shows tutor, meetings, messages | |
| TC031 | Dashboard | Good | Tutor sorting | Click sort by name | List re-orders correctly | |
| TC032 | Dashboard | Good | Tutor filtering | Apply programme filter | Shows matching students only | |

---

### Sprint 3 – Reports & Security

| TC ID | Module | Category | Description | Action | Expected Outcome | Result |
|---|---|---|---|---|---|---|
| TC033 | Reports | Good | 7-day message count | GET `/api/reports/messages?range=7d` | Count matches database | |
| TC034 | Reports | Good | Average messages per tutor | GET average report | Matches manual calculation | |
| TC035 | Reports | Good | Unallocated students list | GET unallocated report | Returns unallocated only | |
| TC036 | Reports | Bad | Non-admin accesses reports | GET as Student or Tutor | 403 Forbidden | |
| TC037 | Reports | Good | 7-day inactivity | GET 7-day inactivity | Inactive student appears | |
| TC038 | Reports | Good | 28-day inactivity | GET 28-day inactivity | Inactive student appears | |
| TC039 | Reports | Bad | Active student in report | GET inactivity report | Active student NOT in list | |
| TC040 | RBAC | Good | Admin access | Navigate to `/admin` | Admin panel loads | |
| TC041 | RBAC | Bad | Student access admin | Navigate to `/admin` | 403 Forbidden | |
| TC042 | RBAC | Bad | Tutor access admin | Navigate to `/admin` | 403 Forbidden | |
| TC043 | RBAC | Bad | Student view other's data | GET another student's ID | 403 Forbidden | |
| TC044 | RBAC | Bad | Expired token | Use expired JWT | 401 Unauthorised | |
| TC045 | RBAC | Bad | Old token after rotation | Use token from before refresh | 401 Unauthorised | |

---

## 10. Summary

Fill this in as we go.

| Sprint | Total Cases | Pass | Fail | Blocked | Pass Rate |
|---|---|---|---|---|---|
| Sprint 0 + 1 | 10 | 10 | 0 | 0 | 100% |
| Sprint 2 | 22 | | | | |
| Sprint 3 | 13 | | | | |
| **Total** | **45** | | | | |

---

*Tester: _________________________ Date: _________________________*

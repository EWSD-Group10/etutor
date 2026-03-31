# eTutor Backend Architecture

## Overview

The backend is an Express.js API server built around a small number of core responsibilities:

- Authentication and authorization
- User and role management (admin, tutor, student)
- Resource CRUD (students, tutors, allocations, meetings, messages, blogs, documents, notifications)
- Security and request protection
- Database access via Prisma (Postgres)

## Project structure

- `src/index.js` - application entry point, global middleware, CORS policy, route definitions.
- `src/middleware/auth.js` - token validation and role-based gates (`requireSignin`, `isAdmin`, `isTutor`).
- `src/middleware/rateLimiter.js` - express-rate-limit setup for global and auth-specific rate limiting.
- `src/controllers/*.js` - controllers grouped by resource domain.
- `src/utils/*` - utility functions for auth, passwords, reporting, email, database helpers.
- `src/cron/inactivityCheck.js` - scheduled jobs.
- `prisma/schema.prisma` and `prisma/migrations/` - database schema and migrations.

## Core security configuration

### Authentication

- JWT-based auth in `src/utils/auth.js`
  - `generateAccessToken(user)` (short-lived)
  - `generateRefreshToken(user)` (longer-lived)
  - `verifyToken(token)`
- `src/controllers/auth.js` perceives login/refresh/logout and returns auth tokens.

### Middleware protections

- `helmet()` is enabled in `src/index.js`.
- CORS is configured by environment variable:
  - `FRONTEND_ORIGIN` (fallback `http://localhost:3000`).
- Production trust proxy for secure cookies behind reverse proxies.
- `cookieParser()` with `httpOnly`, `sameSite` and `secure` flags for refresh token cookie.

### Rate limiting

- `globalLimiter` for all API requests.
- `authLimiter` for login/refresh endpoints.
- 15-minute windows with conservative request caps.

## Input validation

- `zod` schemas are used to validate inbound payloads for essential flows:
  - `auth.js`: `loginSchema` (email + password length).
  - `students.js`: `createStudentSchema` + `updateStudentSchema`.
  - `teachers.js`: `createTutorSchema` + `updateTutorSchema`.

## Role-based access control

Protects endpoints at route layer:

- Admin-only routes (user management, reporting, admin panels).
- Tutor-only routes (tutor dashboard, group management).
- Generic signed-in user routes for personal data, messages, meetings.

## Data access

Database operations use Prisma with explicit `select` shape in controller functions.

- API pagination for list endpoints (`page`, `limit`).
- UUID and email pattern checks for query parameter safety.

## Stability and maintainability

- Single-incoming-entry split into middleware + controllers.
- Shared business logic in utilities (auth, hash, mail, activity logs).
- Exceptions handled with consistent status codes and `500` default fallback.

## How to run

```bash
cd backend
npm install
npm run dev
```

Ensure `.env` exists and includes relevant variables (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`).

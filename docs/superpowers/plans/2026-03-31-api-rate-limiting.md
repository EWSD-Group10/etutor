# API Rate Limiting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two-layer in-memory rate limiting to the Express backend — a global 100 req/15 min limiter on all routes, and a stricter 10 req/15 min limiter on auth endpoints, with consistent 429 error responses.

**Architecture:** Install `express-rate-limit`, create a dedicated middleware file exporting `globalLimiter` and `authLimiter`, then wire both into `index.js`. The auth limiter is stacked on top of the global one for `/api/login` and `/api/refresh`. A custom `handler` on each limiter returns a consistent JSON error shape.

**Tech Stack:** Express.js v5, `express-rate-limit` (in-memory store, no Redis)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `backend/src/middleware/rateLimiter.js` | Exports `globalLimiter` and `authLimiter` |
| Modify | `backend/src/index.js` | Import and apply both limiters |

---

### Task 1: Install express-rate-limit

**Files:**
- Modify: `backend/package.json` (via npm install)

- [ ] **Step 1: Install the package**

```bash
cd backend && npm install express-rate-limit
```

Expected output: `added 1 package` (no sub-dependencies).

- [ ] **Step 2: Verify it's in package.json**

```bash
grep "express-rate-limit" backend/package.json
```

Expected: a line like `"express-rate-limit": "^7.x.x"`.

- [ ] **Step 3: Commit**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore: add express-rate-limit dependency"
```

---

### Task 2: Create the rateLimiter middleware

**Files:**
- Create: `backend/src/middleware/rateLimiter.js`

- [ ] **Step 1: Create the file**

```javascript
// backend/src/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";

function retryAfterSeconds(res) {
  const reset = res.getHeader("RateLimit-Reset");
  if (!reset) return null;
  return Math.ceil(Number(reset) - Date.now() / 1000);
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      error: "Too many requests, please try again later.",
      retryAfter: retryAfterSeconds(res),
    });
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    res.status(429).json({
      error: "Too many login attempts, please try again later.",
      retryAfter: retryAfterSeconds(res),
    });
  },
});
```

- [ ] **Step 2: Verify the file was created**

```bash
cat backend/src/middleware/rateLimiter.js
```

Expected: the full file content above.

- [ ] **Step 3: Commit**

```bash
git add backend/src/middleware/rateLimiter.js
git commit -m "feat: add globalLimiter and authLimiter middleware"
```

---

### Task 3: Wire limiters into index.js

**Files:**
- Modify: `backend/src/index.js:82` (import line near other middleware imports)
- Modify: `backend/src/index.js:96` (after the cors `app.use` block)
- Modify: `backend/src/index.js:128` (login route)
- Modify: `backend/src/index.js:134` (refresh route)

- [ ] **Step 1: Add the import**

At the top of `backend/src/index.js`, add the import alongside the existing middleware import on line 82:

```javascript
import { requireSignin, isAdmin, isTutor } from "./middleware/auth.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
```

- [ ] **Step 2: Apply globalLimiter after cors**

After the `app.use(cors(...))` block (currently ends at line 96), add:

```javascript
app.use(globalLimiter);
```

The middleware block should look like:

```javascript
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(globalLimiter);
```

- [ ] **Step 3: Add authLimiter to login route**

Change line 128 from:

```javascript
app.post("/api/login", login);
```

to:

```javascript
app.post("/api/login", authLimiter, login);
```

- [ ] **Step 4: Add authLimiter to refresh route**

Change line 134 from:

```javascript
app.post("/api/refresh", refresh);
```

to:

```javascript
app.post("/api/refresh", authLimiter, refresh);
```

- [ ] **Step 5: Start the server and verify no startup errors**

```bash
cd backend && node src/index.js
```

Expected: server starts on port 8080 with no errors.

- [ ] **Step 6: Smoke test — global limiter headers present**

```bash
curl -i http://localhost:8080/health
```

Expected: response includes headers like:
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: <epoch seconds>
```

- [ ] **Step 7: Smoke test — auth limiter on login**

```bash
curl -i -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'
```

Expected: response includes `RateLimit-Limit: 10` header.

- [ ] **Step 8: Smoke test — trigger 429 on auth endpoint**

Run the following 11 times rapidly (exceeds the 10-request auth limit):

```bash
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8080/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"x@x.com","password":"wrong"}'
done
```

Expected: first 10 return `401` (wrong credentials), 11th returns `429`.

- [ ] **Step 9: Verify 429 response shape**

```bash
curl -s -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"x@x.com","password":"wrong"}' | cat
```

After triggering the limit, expected:

```json
{
  "error": "Too many login attempts, please try again later.",
  "retryAfter": <number>
}
```

- [ ] **Step 10: Commit**

```bash
git add backend/src/index.js
git commit -m "feat: apply global and auth rate limiters"
```

---

## Verification Checklist

- [ ] `GET /health` returns `RateLimit-Limit: 100` header
- [ ] `POST /api/login` returns `RateLimit-Limit: 10` header
- [ ] After 11 rapid login requests from the same IP, the 11th returns HTTP 429 with `{ error, retryAfter }`
- [ ] `retryAfter` is a positive integer (seconds)
- [ ] No legacy `X-RateLimit-*` headers present
- [ ] Server starts cleanly with no errors

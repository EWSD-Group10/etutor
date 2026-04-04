# eTutor backend – Postman test scripts
**Project:** EWSD eTutor System | **Sprint:** 2 (Interaction Engine)

This document provides ready-to-use JavaScript snippets for Postman. Use these in the **Tests** tab of your requests to automate verification and handle JWT tokens.

---

## 1. Environment setup
Before running these tests, create a Postman Environment (e.g., `eTutor-Local`) and add these variables:
*   `base_url`: `http://localhost:8080`
*   `jwt_token`: (Leave blank, the login script will fill this)

---

## 2. Authentication & token handling
**Request:** `POST {{base_url}}/api/login`

```javascript
// Verify success
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
});

// Auto-save token for all subsequent requests
const jsonData = pm.response.json();
if (jsonData.token) {
    pm.environment.set("jwt_token", jsonData.token);
    pm.environment.set("user_role", jsonData.user.role);
    console.log("Token saved for: " + jsonData.user.email);
}

pm.test("Response includes user profile", function () {
    pm.expect(jsonData.user).to.have.property('email');
    pm.expect(jsonData.user).to.have.property('role');
});
```

---

## 3. Messaging (Sprint 2)
**Request:** `POST {{base_url}}/api/messages`

```javascript
pm.test("Message created", function () {
    pm.response.to.have.status(201);
});

const jsonData = pm.response.json();
pm.test("Response contains valid message ID", function () {
    pm.expect(jsonData.id).to.be.a('number');
});

// Save the message ID to test deletion or replies later
pm.environment.set("last_message_id", jsonData.id);
```

---

## 4. Meetings (Sprint 2)
**Request:** `POST {{base_url}}/api/meetings`

```javascript
pm.test("Meeting request sent", function () {
    pm.response.to.have.status(201);
});

const jsonData = pm.response.json();
pm.test("Initial status is pending", function () {
    pm.expect(jsonData.status).to.equal("pending");
});

pm.environment.set("last_meeting_id", jsonData.id);
```

**Request:** `PUT {{base_url}}/api/meetings/:id` (Tutor Action)
```javascript
pm.test("Meeting updated successfully", function () {
    pm.response.to.have.status(200);
});

const jsonData = pm.response.json();
pm.test("Status is accepted or rejected", function () {
    pm.expect(["accepted", "rejected"]).to.include(jsonData.status);
});
```

---

## 5. Blogs & Documents (Sprint 2)
**Request:** `POST {{base_url}}/api/blogs`
```javascript
pm.test("Blog post created", function () {
    pm.response.to.have.status(201);
});
pm.environment.set("last_blog_id", pm.response.json().id);
```

**Request:** `POST {{base_url}}/api/documents` (Form-data)
```javascript
pm.test("File upload successful", function () {
    pm.response.to.have.status(201);
});

const jsonData = pm.response.json();
pm.test("Has filePath in response", function () {
    pm.expect(jsonData).to.have.property('filePath');
});
```

---

## 6. Security & RBAC (Negative Tests)
**Scenario:** Student trying to access Admin Dashboard (`GET /api/admin/dashboard`)
```javascript
pm.test("Access denied for non-admin", function () {
    pm.response.to.have.status(403);
});

const jsonData = pm.response.json();
pm.test("Error message is clear", function () {
    pm.expect(jsonData.message).to.include("Forbidden");
});
```

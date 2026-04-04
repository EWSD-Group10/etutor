# eTutor frontend – Browser testing guide (Sprint 0 & 1)
**Project:** EWSD eTutor System | **Frontend:** Next.js 14, MUI, Tailwind, React Query

This guide is specific to **Sprint 0** (Auth & RBAC) and **Sprint 1** (Admin & Allocations). Use these steps to verify your core setup before moving to interaction features.

---

## 1. Using browser DevTools

### A. Network tab (Check your API)
*   **Login Check**: Look for `POST /api/login`. Verify it sends the JSON body and receives a **200 OK** with a token.
*   **Admin Data**: Watch for `GET /api/students` and `GET /api/tutors`. These should fire only when navigating to the Admin lists.
*   **Allocation Request**: When clicking "Allocate," look for `POST /api/allocations`. Ensure the Student ID and Tutor ID are sent correctly.

### B. Application tab (Verify JWT)
*   **Token persistence**: After logging in, verify that the `accessToken` is stored in **Local Storage**. 
*   **Role Check**: Check if the `userRole` (Admin/Student/Tutor) matches the account you logged in with.
*   **Logout**: After clicking "Logout," confirm that all storage is cleared immediately.

---

## 2. Core UI test scenarios

### Sprint 0: Authentication & RBAC
1.  **Successful Login**: Log in with an Admin account. Ensure you are redirected to the Admin Dashboard, not the Student one.
2.  **Failed Login**: Try logging in with a non-existent user. Check that a red toast notification appears and the input fields don't clear (to allow correction).
3.  **Role Blocking**: Log in as a Student. Manually navigate to `/api/tutors` or `/admin/students`. You should see an error or be kicked back to your dashboard.

### Sprint 1: Admin Management & Allocations
1.  **Student/Tutor Lists**: Navigate to the student table. Click the headers to sort by "Name" or "ID." Ensure **TanStack Table** sorts locally without a full page reload.
2.  **Single Allocation**: Select an unassigned student and assign them to a tutor. 
    *   *Check*: Does the student's status update to "Assigned" instantly in the UI?
3.  **Bulk Allocation**: Select multiple students (10+) and assign them to a single tutor.
    *   *Check*: Verify the `POST` request payload contains an array of IDs. Ensure the UI handles the "Success" toast after the bulk update.
4.  **Form Validation**: Try to allocate a student without selecting a tutor.
    *   *Check*: Does the MUI "Allocate" button remain disabled, or does a validation message appear from **Yup**?

---

## 3. Layout & responsiveness (Tailwind)

Use the **Device Toolbar** (Ctrl+Shift+M) in Chrome to check these Sprint 0/1 layouts:
*   **Sidebar**: On mobile, does it collapse into a side-drawer? On desktop, is it pinned to the left?
*   **Tables**: On small screens, does the student table have a horizontal scrollbar, or do columns hide gracefully?
*   **Dashboard Cards**: Do the "Total Students" and "Unallocated" counts stack vertically on mobile?

---

## 4. Common "Gotchas"

*   **Token Refresh**: If the session expires, does the frontend redirect you back to the login screen automatically?
*   **The "Loading" State**: When you click "Bulk Allocate," does the button show a spinner? This prevents the user from clicking twice while the backend processes 10+ records.
*   **Z-Index**: Check that the "Allocate" modal/dropdown appears *above* the sidebar and table headers.

---
*Last Updated: March 2026*

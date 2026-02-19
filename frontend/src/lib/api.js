const API_BASE = import.meta.env.VITE_API_BASE_URL || ""

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  let data = null
  const text = await res.text()
  try {
    data = text ? JSON.parse(text) : null
  } catch (err) {
    data = text
  }

  if (!res.ok) {
    const message = data?.error || res.statusText || "Request failed"
    throw new Error(message)
  }
  return data
}

export const api = {
  login: (payload) =>
    request("/api/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: () =>
    request("/api/logout", {
      method: "POST",
    }),
  currentUser: () => request("/api/current-user"),
  adminDashboard: () => request("/api/admin/dashboard"),
  adminAssignOptions: () => request("/api/admin/assign-options"),
  adminCreateUser: (payload) =>
    request("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminAssignStudents: (payload) =>
    request("/api/admin/assign-students", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  studentDashboard: () => request("/api/student/dashboard"),
  tutorDashboard: () => request("/api/tutor/dashboard"),
  listStudents: (params = "") => request(`/api/students${params ? `?${params}` : ""}`),
  createStudent: (payload) =>
    request("/api/students", { method: "POST", body: JSON.stringify(payload) }),
  updateStudent: (id, payload) =>
    request(`/api/students/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteStudent: (id) => request(`/api/students/${id}`, { method: "DELETE" }),
  listTutors: (params = "") => request(`/api/tutors${params ? `?${params}` : ""}`),
  createTutor: (payload) =>
    request("/api/tutors", { method: "POST", body: JSON.stringify(payload) }),
  updateTutor: (id, payload) =>
    request(`/api/tutors/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTutor: (id) => request(`/api/tutors/${id}`, { method: "DELETE" }),
  listAllocations: (params = "") =>
    request(`/api/allocations${params ? `?${params}` : ""}`),
  listUnassignedStudents: (params = "") =>
    request(`/api/allocations/unassigned${params ? `?${params}` : ""}`),
  createAllocation: (payload) =>
    request("/api/allocations", { method: "POST", body: JSON.stringify(payload) }),
  bulkCreateAllocations: (payload) =>
    request("/api/allocations/bulk", { method: "POST", body: JSON.stringify(payload) }),
  updateAllocation: (id, payload) =>
    request(`/api/allocations/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteAllocation: (id) => request(`/api/allocations/${id}`, { method: "DELETE" }),
  listInbox: () => request("/api/messages/inbox"),
  listMessageContacts: () => request("/api/messages/contacts"),
  listMessages: (withUserId) => request(`/api/messages?withUserId=${encodeURIComponent(withUserId)}`),
  sendMessage: (payload) =>
    request("/api/messages", { method: "POST", body: JSON.stringify(payload) }),
  listBlogs: (q = "") => request(`/api/blogs${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  createBlog: (payload) =>
    request("/api/blogs", { method: "POST", body: JSON.stringify(payload) }),
  getBlog: (id) => request(`/api/blogs/${id}`),
  addBlogComment: (id, payload) =>
    request(`/api/blogs/${id}/comments`, { method: "POST", body: JSON.stringify(payload) }),
  listDocuments: (q = "") =>
    request(`/api/documents${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  createDocument: (payload) =>
    request("/api/documents", { method: "POST", body: JSON.stringify(payload) }),
  getDocument: (id) => request(`/api/documents/${id}`),
  addDocumentComment: (id, payload) =>
    request(`/api/documents/${id}/comments`, { method: "POST", body: JSON.stringify(payload) }),
  listMeetings: () => request("/api/meetings"),
  createMeeting: (payload) =>
    request("/api/meetings", { method: "POST", body: JSON.stringify(payload) }),
  updateMeetingStatus: (id, payload) =>
    request(`/api/meetings/${id}/status`, { method: "PATCH", body: JSON.stringify(payload) }),
  tutorGroupStats: () => request("/api/reports/tutor/group-stats"),
  studentEngagementSummary: () => request("/api/reports/student/engagement-summary"),
}

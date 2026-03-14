import api from "../../../lib/axios";

// Types
export interface BlogUser {
  id: string;
  name: string | null;
  email: string;
  role?: string;
}

export interface BlogPost {
  id: string;
  groupId: string | null;
  tutorId: string;
  studentId: string | null;
  title: string | null;
  content: string;
  sorting: number | null;
  createdAt: string;
  createdBy: string | null;
  tutor: BlogUser;
  student: BlogUser | null;
  commentCount?: number;
  comments?: BlogComment[];
}

export interface BlogComment {
  id: string;
  commentText: string;
  createdAt: string;
  commenterId: string;
  commenter: {
    id: string;
    name: string | null;
    role: string;
  };
}

export interface BlogGroup {
  id: string;
  groupId: string | null;
  tutorId: string;
  studentId: string | null;
  title: string | null;
  content: string;
  createdAt: string;
  tutor: BlogUser;
  student: BlogUser | null;
  commentCount?: number;
}

// Response types
export interface BlogsResponse {
  data: BlogPost[];
}

export interface BlogResponse {
  data: BlogPost;
}

export interface BlogGroupResponse {
  data: BlogGroup[];
}

export interface CreateBlogInput {
  title: string;
  content: string;
  sorting?: number;
}

export interface UpdateBlogInput {
  title?: string;
  content?: string;
  sorting?: number;
}

// API functions

// Fetch list of blogs (tutor sees masters, student sees their copies)
export const fetchBlogs = async (): Promise<BlogsResponse> => {
  const response = await api.get<BlogsResponse>("/api/blogs");
  return response.data;
};

// Fetch a single blog with comments
export const fetchBlog = async (id: string): Promise<BlogResponse> => {
  const response = await api.get<BlogResponse>(`/api/blogs/${id}`);
  return response.data;
};

// Fetch all student copies in a group (for tutor's 2-level view)
export const fetchBlogGroup = async (groupId: string): Promise<BlogGroupResponse> => {
  const response = await api.get<BlogGroupResponse>(`/api/blogs/group/${groupId}`);
  return response.data;
};

// Create a new blog (tutor only) - creates master + copies for all students
export const createBlog = async (input: CreateBlogInput): Promise<{ data: { master: BlogPost; copies: BlogPost[]; totalStudents: number } }> => {
  const response = await api.post("/api/blogs", input);
  return response.data;
};

// Update blog (tutor only) - updates all copies in group
export const updateBlog = async (id: string, input: UpdateBlogInput): Promise<BlogResponse> => {
  const response = await api.put<BlogResponse>(`/api/blogs/${id}`, input);
  return response.data;
};

// Delete blog (tutor only) - deletes all copies in group
export const deleteBlog = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/api/blogs/${id}`);
  return response.data;
};

// Fetch comments for a blog
export const fetchBlogComments = async (blogId: string): Promise<{ data: BlogComment[] }> => {
  const response = await api.get<{ data: BlogComment[] }>(`/api/blogs/${blogId}/comments`);
  return response.data;
};

// Add comment to a blog
export const addBlogComment = async (blogId: string, commentText: string): Promise<{ data: BlogComment }> => {
  const response = await api.post<{ data: BlogComment }>(`/api/blogs/${blogId}/comments`, { commentText });
  return response.data;
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBlogs,
  fetchBlog,
  fetchBlogGroup,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogComments,
  addBlogComment,
  CreateBlogInput,
  UpdateBlogInput,
} from "./query";

// Query keys
export const blogKeys = {
  all: ["blogs"] as const,
  lists: () => [...blogKeys.all, "list"] as const,
  list: () => [...blogKeys.lists()] as const,
  details: () => [...blogKeys.all, "detail"] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const,
  groups: () => [...blogKeys.all, "group"] as const,
  group: (groupId: string) => [...blogKeys.groups(), groupId] as const,
  comments: (blogId: string) => [...blogKeys.all, "comments", blogId] as const,
};

// Hook: Fetch list of blogs
export const useBlogs = () => {
  return useQuery({
    queryKey: blogKeys.list(),
    queryFn: fetchBlogs,
  });
};

// Hook: Fetch single blog with comments
export const useBlog = (id: string) => {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => fetchBlog(id),
    enabled: !!id,
  });
};

// Hook: Fetch all student copies in a group (tutor view)
export const useBlogGroup = (groupId: string) => {
  return useQuery({
    queryKey: blogKeys.group(groupId),
    queryFn: () => fetchBlogGroup(groupId),
    enabled: !!groupId,
  });
};

// Hook: Fetch comments for a blog
export const useBlogComments = (blogId: string) => {
  return useQuery({
    queryKey: blogKeys.comments(blogId),
    queryFn: () => fetchBlogComments(blogId),
    enabled: !!blogId,
  });
};

// Hook: Create blog (tutor only)
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

// Hook: Update blog (tutor only)
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlogInput }) =>
      updateBlog(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

// Hook: Delete blog (tutor only)
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
    },
  });
};

// Hook: Add comment to blog
export const useAddBlogComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ blogId, commentText }: { blogId: string; commentText: string }) =>
      addBlogComment(blogId, commentText),
    onSuccess: (_, { blogId }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.comments(blogId) });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(blogId) });
    },
  });
};

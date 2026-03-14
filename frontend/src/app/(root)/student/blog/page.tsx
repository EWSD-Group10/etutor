"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  alpha,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import {
  useBlogs,
  useBlog,
  useAddBlogComment,
  BlogPost,
} from "@/app/hooks/blogs/useBlogs";

type ViewMode = "list" | "detail";

export default function StudentBlogPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Queries & Mutations
  const { data: blogsData, isLoading: blogsLoading } = useBlogs();
  const { data: blogData, isLoading: blogLoading } = useBlog(selectedBlogId || "");
  const addCommentMutation = useAddBlogComment();

  // Student's blogs (these are the copies assigned to the student)
  const studentBlogs = blogsData?.data.filter((b) => b.studentId !== null) || [];

  // Handle: Click on blog → go to detail view
  const handleBlogClick = (blog: BlogPost) => {
    setSelectedBlogId(blog.id);
    setViewMode("detail");
  };

  // Handle: Add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedBlogId) return;

    try {
      await addCommentMutation.mutateAsync({
        blogId: selectedBlogId,
        commentText: newComment,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  // Navigate back
  const handleBack = () => {
    setViewMode("list");
    setSelectedBlogId(null);
  };

  // Render: List of blogs
  const renderBlogList = () => (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
          My Blogs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Private blog posts from your tutor
        </Typography>
      </Box>

      {/* Blog List */}
      {blogsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : studentBlogs.length > 0 ? (
        <Stack spacing={0}>
          {studentBlogs.map((post) => (
            <Card
              key={post.id}
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 4,
                boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
                border: "1px solid",
                borderColor: alpha("#000", 0.05),
                cursor: "pointer",
                "&:hover": {
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
                },
              }}
              onClick={() => handleBlogClick(post)}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
                >
                  {post.title}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    From {post.tutor?.name || "Tutor"}
                  </Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />
                  <Chip
                    label={`${post.commentCount || 0} comments`}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                  />
                </Stack>
              </Box>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box
          sx={{
            p: 8,
            textAlign: "center",
            bgcolor: "white",
            borderRadius: 4,
            border: "1px dashed",
            borderColor: alpha("#000", 0.1),
          }}
        >
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            No blog posts yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Your tutor hasn't created any blog posts for you
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Render: Blog detail with comments
  const renderBlogDetail = () => (
    <Box>
      {/* Header with back button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, ml: 1 }}>
          {blogData?.data.title}
        </Typography>
      </Box>

      {blogLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {/* Blog content */}
          <Card sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle2" color="text.secondary">
                From: {blogData?.data.tutor?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(blogData?.data.createdAt || "").toLocaleDateString()}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {blogData?.data.content}
            </Typography>
          </Card>

          <Divider sx={{ my: 3 }} />

          {/* Comments */}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            Comments ({blogData?.data.comments?.length || 0})
          </Typography>

          <Stack spacing={2} sx={{ mb: 3 }}>
            {blogData?.data.comments?.map((comment) => (
              <Card
                key={comment.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: comment.commenter.role === "tutor" ? alpha("#1976d2", 0.05) : alpha("#000", 0.02),
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {comment.commenter.name}
                    {comment.commenter.role === "tutor" && (
                      <Chip
                        label="Tutor"
                        size="small"
                        sx={{ ml: 1, height: 18, fontSize: "0.6rem", fontWeight: 600 }}
                      />
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <Typography variant="body2">{comment.commentText}</Typography>
              </Card>
            ))}
          </Stack>

          {/* Comment input */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
              multiline
              maxRows={3}
            />
            <IconButton
              color="primary"
              onClick={handleAddComment}
              disabled={!newComment.trim() || addCommentMutation.isPending}
              sx={{ bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {viewMode === "list" && renderBlogList()}
      {viewMode === "detail" && renderBlogDetail()}
    </Box>
  );
}

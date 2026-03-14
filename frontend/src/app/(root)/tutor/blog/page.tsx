"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
  Divider,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  useBlogs,
  useCreateBlog,
  useDeleteBlog,
  useBlogGroup,
  useBlog,
  useAddBlogComment,
  BlogPost,
  BlogGroup,
} from "@/app/hooks/blogs/useBlogs";

// Type for view levels
type ViewLevel = "list" | "students" | "conversation";

export default function BlogPage() {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("list");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Comment input state
  const [newComment, setNewComment] = useState("");

  // Queries & Mutations
  const { data: blogsData, isLoading: blogsLoading } = useBlogs();
  const { data: groupData, isLoading: groupLoading } = useBlogGroup(selectedGroupId || "");
  const { data: blogData, isLoading: blogLoading } = useBlog(selectedBlogId || "");

  const createBlogMutation = useCreateBlog();
  const deleteBlogMutation = useDeleteBlog();
  const addCommentMutation = useAddBlogComment();

  // Level 1: List of master blogs
  const masterBlogs = blogsData?.data.filter((b) => b.studentId === null) || [];

  // Handle: Click on master blog → go to Level 2
  const handleBlogClick = (blog: BlogPost) => {
    setSelectedGroupId(blog.groupId);
    setSelectedStudentName(blog.title);
    setViewLevel("students");
  };

  // Handle: Click on student → go to Level 3
  const handleStudentClick = (studentBlog: BlogGroup) => {
    setSelectedBlogId(studentBlog.id);
    setSelectedStudentName(studentBlog.student?.name || "Student");
    setViewLevel("conversation");
  };

  // Handle: Create new blog
  const handleCreateBlog = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await createBlogMutation.mutateAsync({
        title: newTitle,
        content: newContent,
      });
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewContent("");
    } catch (error) {
      console.error("Failed to create blog:", error);
    }
  };

  // Handle: Delete blog
  const handleDeleteBlog = async (groupId: string) => {
    if (!confirm("This will delete this blog for ALL students. Continue?")) return;

    // Find a blog in the group to delete
    const blogInGroup = groupData?.data.find((b) => b.groupId === groupId);
    if (blogInGroup) {
      await deleteBlogMutation.mutateAsync(blogInGroup.id);
      setViewLevel("list");
      setSelectedGroupId(null);
    }
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
    if (viewLevel === "conversation") {
      setViewLevel("students");
      setSelectedBlogId(null);
    } else if (viewLevel === "students") {
      setViewLevel("list");
      setSelectedGroupId(null);
    }
  };

  // Render Level 1: List of master blogs
  const renderBlogList = () => (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary" }}>
          Blog Posts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.2)",
          }}
        >
          Create New Post
        </Button>
      </Box>

      {/* Blog List */}
      {blogsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : masterBlogs.length > 0 ? (
        <Stack spacing={0}>
          {masterBlogs.map((post) => (
            <BlogListItem
              key={post.id}
              blog={post}
              onClick={() => handleBlogClick(post)}
              onDelete={() => handleDeleteBlog(post.groupId!)}
            />
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
            No blog posts found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Click the button above to create your first post
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Render Level 2: List of students with copies
  const renderStudentList = () => (
    <Box>
      {/* Header with back button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {selectedStudentName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a student to view their blog & comments
          </Typography>
        </Box>
      </Box>

      {groupLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {groupData?.data
            .filter((b) => b.studentId !== null)
            .map((studentBlog) => (
              <Card
                key={studentBlog.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: alpha("#000", 0.05),
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.04),
                    borderColor: alpha("#1976d2", 0.2),
                  },
                }}
                onClick={() => handleStudentClick(studentBlog)}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "#1976d2" }}>
                      {studentBlog.student?.name?.[0]?.toUpperCase() || "S"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {studentBlog.student?.name || "Unknown Student"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {studentBlog.student?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={`${studentBlog.commentCount || 0} comments`}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Card>
            ))}
        </Stack>
      )}
    </Box>
  );

  // Render Level 3: Conversation (comments)
  const renderConversation = () => (
    <Box>
      {/* Header with back button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, ml: 1 }}>
          {selectedStudentName}
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              {blogData?.data.title}
            </Typography>
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
                    {comment.commenter.name || "Unknown"}
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
      {viewLevel === "list" && renderBlogList()}
      {viewLevel === "students" && renderStudentList()}
      {viewLevel === "conversation" && renderConversation()}

      {/* Create Blog Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Blog Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateBlog}
            disabled={createBlogMutation.isPending || !newTitle.trim() || !newContent.trim()}
          >
            {createBlogMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Blog list item component
interface BlogListItemProps {
  blog: BlogPost;
  onClick: () => void;
  onDelete: () => void;
}

function BlogListItem({ blog, onClick, onDelete }: BlogListItemProps) {
  return (
    <Card
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
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
            {blog.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              By {blog.tutor?.name || "Tutor"}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {new Date(blog.createdAt).toLocaleDateString()}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: "text.disabled" }} />
            <Chip
              label={`${blog.commentCount || 0} comments`}
              size="small"
              sx={{ fontWeight: 600, fontSize: "0.65rem" }}
            />
          </Stack>
        </Box>
        <IconButton
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </Card>
  );
}

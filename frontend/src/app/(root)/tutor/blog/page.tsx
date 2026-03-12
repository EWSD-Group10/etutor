"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BlogPostItem, { BlogStatus } from "@/app/components/blog/BlogPostItem";

const blogPostsData = [
  {
    id: "1",
    title: "Tips for Exam Preparation",
    author: "Dr. Sarah Jenkins",
    date: "Mar 13, 2026",
    status: "published" as BlogStatus,
  },
  {
    id: "2",
    title: "Welcome to the new semester",
    author: "Dr. Sarah Jenkins",
    date: "Mar 11, 2026",
    status: "published" as BlogStatus,
  },
];

export default function BlogPage() {
  const handleEdit = (id: string) => {
    console.log("Edit post:", id);
  };

  const handleCreatePost = () => {
    console.log("Create new post");
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
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
          onClick={handleCreatePost}
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

      {/* Blog Post List */}
      <Stack spacing={0}>
        {blogPostsData.length > 0 ? (
          blogPostsData.map((post) => (
            <BlogPostItem
              key={post.id}
              {...post}
              onEdit={handleEdit}
            />
          ))
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
      </Stack>
    </Box>
  );
}

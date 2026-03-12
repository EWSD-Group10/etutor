"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  alpha,
  Chip,
  Button,
} from "@mui/material";

export type BlogStatus = "published" | "draft" | "archived";

interface BlogPostItemProps {
  id: string;
  title: string;
  author: string;
  date: string;
  status: BlogStatus;
  onEdit?: (id: string) => void;
}

const BlogPostItem: React.FC<BlogPostItemProps> = ({
  id,
  title,
  author,
  date,
  status,
  onEdit,
}) => {
  const getStatusColor = (status: BlogStatus) => {
    switch (status) {
      case "published":
        return "#2e7d32";
      case "draft":
        return "#ed6c02";
      case "archived":
        return "#d32f2f";
      default:
        return "grey";
    }
  };

  return (
    <Card
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 4,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
        border: "1px solid",
        borderColor: alpha("#000", 0.05),
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            By
          </Typography>
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: "text.disabled",
            }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {author}
          </Typography>
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              bgcolor: "text.disabled",
            }}
          />
          <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {date}
          </Typography>
        </Stack>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          label={status}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: "0.65rem",
            textTransform: "capitalize",
            bgcolor: alpha(getStatusColor(status), 0.08),
            color: getStatusColor(status),
            minWidth: 80,
          }}
        />
        <Button
          size="small"
          onClick={() => onEdit?.(id)}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "text.primary",
            "&:hover": {
              bgcolor: alpha("#000", 0.04),
            },
          }}
        >
          Edit
        </Button>
      </Stack>
    </Card>
  );
};

export default BlogPostItem;

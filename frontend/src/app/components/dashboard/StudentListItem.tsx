"use client";

import React from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  Stack,
  alpha,
} from "@mui/material";

interface StudentListItemProps {
  id: string;
  name: string;
  engagement: number;
  initials?: string;
}

const StudentListItem: React.FC<StudentListItemProps> = ({
  id,
  name,
  engagement,
  initials,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement > 80) return "#2e7d32"; // Green
    if (engagement > 50) return "#ed6c02"; // Orange
    return "#d32f2f"; // Red
  };

  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha("#1976d2", 0.1),
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {initials || getInitials(name)}
        </Avatar>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
      </Stack>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="caption" color="textSecondary" sx={{ display: "block" }}>
          Engagement
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: getEngagementColor(engagement) }}
        >
          {engagement} %
        </Typography>
      </Box>
    </Card>
  );
};

export default StudentListItem;

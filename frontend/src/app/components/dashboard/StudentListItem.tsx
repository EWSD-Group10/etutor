"use client";

import React from "react";
import { Box, Avatar, Typography, Stack, alpha } from "@mui/material";

interface StudentListItemProps {
  id: string;
  name: string;
  engagement: number;
  initials?: string;
}

const StudentListItem: React.FC<StudentListItemProps> = ({
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
    if (engagement > 80) return "#2e7d32";
    if (engagement > 50) return "#ed6c02";
    return "#d32f2f";
  };

  const color = getEngagementColor(engagement);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        py: 1.5,
        px: 0.5,
        borderBottom: "1px solid",
        borderColor: alpha("#000", 0.06),
        "&:last-child": { borderBottom: "none" },
        "&:hover": { bgcolor: alpha("#1976d2", 0.02) },
        borderRadius: 1,
        transition: "background-color 0.2s",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha("#1976d2", 0.1),
            color: "primary.main",
            fontWeight: 700,
            fontSize: "0.72rem",
            width: 40,
            height: 40,
          }}
        >
          {initials || getInitials(name)}
        </Avatar>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {name}
        </Typography>
      </Stack>

      <Box sx={{ textAlign: "right" }}>
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: "block",
            fontSize: "0.65rem",
            fontWeight: 600,
            mb: 0.2,
          }}
        >
          Engagement
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 800, color, fontSize: "0.82rem" }}
        >
          {engagement} %
        </Typography>
      </Box>
    </Stack>
  );
};

export default StudentListItem;

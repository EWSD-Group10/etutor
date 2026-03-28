"use client";

import React from "react";
import Link from "next/link";
import { Box, Avatar, Typography, Stack, alpha, Chip } from "@mui/material";

interface StudentListItemProps {
  id: string;
  name: string;
  email: string;
  degreeProgram: string | null;
  unreadFromStudent: number;
  /** When true, render as static row (e.g. admin view-as preview). */
  disableLink?: boolean;
}

const StudentListItem: React.FC<StudentListItemProps> = ({
  id,
  name,
  email,
  degreeProgram,
  unreadFromStudent,
  disableLink = false,
}) => {
  const getInitials = (n: string) => {
    return n
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const subtitle =
    degreeProgram?.trim() ||
    email ||
    "";

  const inner = (
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
        ...(!disableLink
          ? {
              "&:hover": { bgcolor: alpha("#1976d2", 0.04) },
            }
          : {}),
        borderRadius: 1,
        transition: "background-color 0.2s",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
        <Avatar
          sx={{
            bgcolor: alpha("#1976d2", 0.1),
            color: "primary.main",
            fontWeight: 700,
            fontSize: "0.72rem",
            width: 40,
            height: 40,
            flexShrink: 0,
          }}
        >
          {getInitials(name || "?")}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary" }}
            noWrap
          >
            {name || "Student"}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Stack>

      <Box sx={{ textAlign: "right", flexShrink: 0, pl: 1 }}>
        {unreadFromStudent > 0 ? (
          <Chip
            label={`${unreadFromStudent} unread`}
            size="small"
            color="warning"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
            Inbox clear
          </Typography>
        )}
      </Box>
    </Stack>
  );

  if (disableLink) {
    return <Box sx={{ color: "inherit" }}>{inner}</Box>;
  }

  return (
    <Link
      href={`/tutor/students/${id}/documents`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {inner}
    </Link>
  );
};

export default StudentListItem;

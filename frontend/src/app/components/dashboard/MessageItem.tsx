"use client";

import React from "react";
import { Box, Avatar, Typography, Stack, alpha } from "@mui/material";

interface MessageItemProps {
  id: string;
  sender: string;
  message: string;
  unreadCount?: number;
  initials?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  sender,
  message,
  unreadCount = 0,
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

  return (
    <Stack
      direction="row"
      spacing={1.5}
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
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Avatar
          sx={{
            bgcolor: alpha("#1976d2", 0.1),
            color: "primary.main",
            fontWeight: 700,
            fontSize: "0.72rem",
            width: 38,
            height: 38,
            flexShrink: 0,
          }}
        >
          {initials || getInitials(sender)}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.2 }}
          >
            {sender}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            noWrap
            sx={{ display: "block", fontWeight: 400 }}
          >
            {message}
          </Typography>
        </Box>
      </Stack>

      {unreadCount > 0 && (
        <Box
          sx={{
            minWidth: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 800,
            flexShrink: 0,
            px: 0.5,
          }}
        >
          {unreadCount}
        </Box>
      )}
    </Stack>
  );
};

export default MessageItem;

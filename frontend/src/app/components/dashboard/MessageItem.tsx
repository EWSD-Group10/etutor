"use client";

import React from "react";
import {
  Box,
  Card,
  Avatar,
  Typography,
  Stack,
  alpha,
  Badge,
} from "@mui/material";

interface MessageItemProps {
  id: string;
  sender: string;
  message: string;
  unreadCount?: number;
  initials?: string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  id,
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
    <Card
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
        border: "1px solid",
        borderColor: alpha("#000", 0.05),
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: alpha("#1976d2", 0.08),
              color: "primary.main",
              fontWeight: 700,
              fontSize: "0.75rem",
              width: 44,
              height: 44,
            }}
          >
            {initials || getInitials(sender)}
          </Avatar>
          <Box sx={{ maxWidth: 180 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
              {sender}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block", fontWeight: 500 }}
            >
              {message}
            </Typography>
          </Box>
        </Stack>
        {unreadCount > 0 && (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              fontWeight: 800,
              boxShadow: "0px 2px 4px rgba(25, 118, 210, 0.3)",
            }}
          >
            {unreadCount}
          </Box>
        )}
      </Stack>
    </Card>
  );
};

export default MessageItem;

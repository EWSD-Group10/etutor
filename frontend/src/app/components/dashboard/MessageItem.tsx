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
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: alpha("#1976d2", 0.1),
              color: "primary.main",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {initials || getInitials(sender)}
          </Avatar>
          <Box sx={{ maxWidth: 180 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {sender}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block" }}
            >
              {message}
            </Typography>
          </Box>
        </Stack>
        {unreadCount > 0 && (
          <Badge
            badgeContent={unreadCount}
            color="primary"
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 700,
                minWidth: 20,
                height: 20,
                borderRadius: "50%",
              },
            }}
          />
        )}
      </Stack>
    </Card>
  );
};

export default MessageItem;

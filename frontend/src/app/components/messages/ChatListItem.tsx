"use client";

import React from "react";
import {
  Box,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  Badge,
  alpha,
} from "@mui/material";

interface ChatListItemProps {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
  onClick?: () => void;
  initials?: string;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  id,
  name,
  lastMessage,
  time,
  unreadCount = 0,
  isActive = false,
  onClick,
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
    <ListItemButton
      onClick={onClick}
      selected={isActive}
      sx={{
        borderRadius: 2,
        mb: 1,
        px: 2,
        py: 1.5,
        "&.Mui-selected": {
          bgcolor: alpha("#1976d2", 0.08),
          "&:hover": {
            bgcolor: alpha("#1976d2", 0.12),
          },
        },
      }}
    >
      <ListItemAvatar>
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
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: unreadCount > 0 ? 700 : 600,
                color: "text.primary",
              }}
            >
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {time}
            </Typography>
          </Box>
        }
        secondary={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0.5,
            }}
          >
            <Typography
              variant="caption"
              color={unreadCount > 0 ? "text.primary" : "text.secondary"}
              noWrap
              sx={{
                maxWidth: "180px",
                fontWeight: unreadCount > 0 ? 500 : 400,
              }}
            >
              {lastMessage}
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
            )}
          </Box>
        }
      />
    </ListItemButton>
  );
};

export default ChatListItem;

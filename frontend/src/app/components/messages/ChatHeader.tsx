"use client";

import React from "react";
import {
  Box,
  Avatar,
  Typography,
  alpha,
  Stack,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PhoneIcon from "@mui/icons-material/Phone";
import VideocamIcon from "@mui/icons-material/Videocam";

interface ChatHeaderProps {
  name: string;
  isOnline?: boolean;
  initials?: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  isOnline = false,
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
    <Box
      sx={{
        p: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "white",
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
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {name}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: isOnline ? "#2e7d32" : "text.disabled",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {isOnline ? "Online" : "Offline"}
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <Stack direction="row" spacing={1}>
        <IconButton size="small" sx={{ color: "text.secondary" }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default ChatHeader;

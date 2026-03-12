"use client";

import React from "react";
import { Box, Typography, alpha } from "@mui/material";

interface ChatMessageProps {
  id: string;
  message: string;
  time: string;
  isSent: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  message,
  time,
  isSent,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isSent ? "flex-end" : "flex-start",
        mb: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          p: 1.5,
          borderRadius: 2,
          bgcolor: isSent ? "primary.main" : alpha("#000", 0.04),
          color: isSent ? "white" : "text.primary",
          boxShadow: isSent ? "0px 2px 4px rgba(25, 118, 210, 0.2)" : "none",
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          {message}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, fontSize: "0.625rem" }}
      >
        {time}
      </Typography>
    </Box>
  );
};

export default ChatMessage;

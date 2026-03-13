"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  IconButton,
  alpha,
  InputAdornment,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
}) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "white",
      }}
    >
      <TextField
        fullWidth
        variant="outlined"
        size="small"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            bgcolor: alpha("#000", 0.03),
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: "transparent",
            },
            "&.Mui-focused fieldset": {
              borderColor: "transparent",
            },
            px: 2,
          },
          mr: 1.5,
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <SentimentSatisfiedAltIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: "text.secondary" }}>
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <IconButton
        onClick={handleSend}
        disabled={!message.trim()}
        sx={{
          bgcolor: "primary.main",
          color: "white",
          width: 44,
          height: 44,
          "&:hover": {
            bgcolor: "primary.dark",
          },
          "&.Mui-disabled": {
            bgcolor: alpha("#1976d2", 0.5),
            color: alpha("#fff", 0.8),
          },
          boxShadow: "0px 4px 10px rgba(25, 118, 210, 0.3)",
        }}
      >
        <SendIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default ChatInput;

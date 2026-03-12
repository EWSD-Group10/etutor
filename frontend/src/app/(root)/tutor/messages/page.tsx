"use client";

import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  List,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatListItem from "@/app/components/messages/ChatListItem";
import ChatHeader from "@/app/components/messages/ChatHeader";
import ChatMessage from "@/app/components/messages/ChatMessage";
import ChatInput from "@/app/components/messages/ChatInput";

export default function MessagesPage() {
  const [activeChat, setActiveChat] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");

  const chats = [
    {
      id: "1",
      name: "Oliver Smith",
      lastMessage: "Can we reschedule our meeting?",
      time: "10:30 AM",
      unreadCount: 2,
      isOnline: true,
      messages: [
        { id: "101", message: "Hi Dr. Jenkins, I have a question about the assignment.", time: "10:15 AM", isSent: false },
        { id: "102", message: "Hello Oliver, sure! What is it?", time: "10:20 AM", isSent: true },
        { id: "103", message: "Can we reschedule our meeting?", time: "10:30 AM", isSent: false },
      ],
    },
    {
      id: "2",
      name: "Emma Jones",
      lastMessage: "hello",
      time: "Just now",
      unreadCount: 0,
      isOnline: true,
      messages: [
        { id: "201", message: "hello", time: "Just now", isSent: false },
      ],
    },
    {
      id: "3",
      name: "Harry Williams",
      lastMessage: "The document is ready for review.",
      time: "Yesterday",
      unreadCount: 0,
      isOnline: false,
      messages: [
        { id: "301", message: "The document is ready for review.", time: "Yesterday", isSent: false },
      ],
    },
  ];

  const currentChat = chats.find((chat) => chat.id === activeChat) || chats[0];

  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message);
  };

  return (
    <Grid container sx={{ height: "100vh", width: "100%", bgcolor: "white", overflow: "hidden" }}>
      {/* Left Column - Chat List */}
      <Grid
        item
        xs={12}
        md={4}
        lg={3}
        sx={{
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Messages
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: alpha("#000", 0.02),
                "& fieldset": {
                  borderColor: "transparent",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <List sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
          {chats
            .filter((chat) =>
              chat.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((chat) => (
              <ChatListItem
                key={chat.id}
                id={chat.id}
                name={chat.name}
                lastMessage={chat.lastMessage}
                time={chat.time}
                unreadCount={chat.unreadCount}
                isActive={activeChat === chat.id}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
        </List>
      </Grid>

      {/* Right Column - Chat Window */}
      <Grid
        item
        xs={12}
        md={8}
        lg={9}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {currentChat ? (
          <>
            <ChatHeader
              name={currentChat.name}
              isOnline={currentChat.isOnline}
            />
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                py: 3,
                bgcolor: alpha("#f8f9fa", 0.3),
                display: "flex",
                flexDirection: "column",
              }}
            >
              {currentChat.messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  id={msg.id}
                  message={msg.message}
                  time={msg.time}
                  isSent={msg.isSent}
                />
              ))}
            </Box>
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            <Typography>Select a conversation to start messaging</Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}

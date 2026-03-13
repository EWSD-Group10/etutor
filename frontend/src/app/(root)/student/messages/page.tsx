"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  List,
  alpha,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChatListItem from "@/app/components/messages/ChatListItem";
import ChatHeader from "@/app/components/messages/ChatHeader";
import ChatMessage from "@/app/components/messages/ChatMessage";
import ChatInput from "@/app/components/messages/ChatInput";
import { useInbox, useMessageContacts, useMessages } from "@/app/hooks/messages/useMessages";
import { useSendMessage } from "@/app/hooks/messages/useSendMessage";
import { useAuth } from "@/app/context/AuthContext";

interface ChatPeer {
  id: string;
  name: string | null;
  role: string;
}

export default function StudentMessagesPage() {
  const { user } = useAuth();
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messagePage, setMessagePage] = useState(1);
  const [selectedPeer, setSelectedPeer] = useState<ChatPeer | null>(null);

  // Fetch inbox (conversations)
  const { data: inboxData, isLoading: inboxLoading } = useInbox();
  
  // Fetch contacts (people you can message)
  const { data: contactsData } = useMessageContacts();

  // Fetch messages when a chat is selected
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(
    activeChatId || "",
    messagePage,
    20
  );

  // Send message mutation
  const sendMessageMutation = useSendMessage();

  // Get the current active chat peer info (from inbox OR selected contact)
  const activeChat = activeChatId 
    ? inboxData?.data.find((item) => item.peer.id === activeChatId)
    : null;

  // If we have a selected peer but no conversation yet, use selectedPeer
  const displayPeer = activeChat?.peer || selectedPeer;

  // Filter contacts based on search
  const filteredContacts = contactsData?.data.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Format time from ISO string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleSendMessage = (content: string) => {
    const recipientId = activeChatId || selectedPeer?.id;
    if (!recipientId || !content.trim()) return;
    
    sendMessageMutation.mutate(
      { recipientId, content },
      {
        onSuccess: () => {
          refetchMessages();
          // Add to inbox if it's a new conversation
          if (selectedPeer) {
            // The inbox will be refetched automatically
          }
        },
      }
    );
  };

  const handleLoadMore = () => {
    setMessagePage((prev) => prev + 1);
  };

  // Get initials helper
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Handle selecting a contact (from search or conversation)
  const handleSelectContact = (contact: { id: string; name: string | null; role: string }) => {
    setActiveChatId(contact.id);
    setSelectedPeer(contact);
    setMessagePage(1);
  };

  if (inboxLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100%",
        bgcolor: "white",
        overflow: "hidden",
      }}
    >
      {/* Left Column - Chat List */}
      <Box
        sx={{
          width: { xs: "100%", md: "320px", lg: "360px" },
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexShrink: 0,
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
          {/* Show contacts if searching */}
          {searchQuery && filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ChatListItem
                key={contact.id}
                id={contact.id}
                name={contact.name || "Unknown"}
                lastMessage="Click to start conversation"
                time=""
                unreadCount={0}
                isActive={activeChatId === contact.id}
                onClick={() => handleSelectContact(contact)}
                initials={getInitials(contact.name)}
              />
            ))
          ) : (
            /* Show conversations */
            inboxData?.data
              .filter((chat) =>
                chat.peer.name?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((chat) => (
                <ChatListItem
                  key={chat.peer.id}
                  id={chat.peer.id}
                  name={chat.peer.name || "Unknown"}
                  lastMessage={chat.lastMessage?.content || ""}
                  time={chat.lastMessage?.createdAt ? formatTime(chat.lastMessage.createdAt) : ""}
                  unreadCount={chat.unreadCount}
                  isActive={activeChatId === chat.peer.id}
                  onClick={() => {
                    handleSelectContact(chat.peer);
                  }}
                  initials={getInitials(chat.peer.name)}
                />
              ))
          )}
          
          {(!inboxData?.data || inboxData.data.length === 0) && !searchQuery && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No conversations yet. Search to start one!
              </Typography>
            </Box>
          )}
        </List>
      </Box>

      {/* Right Column - Chat Window */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          flexGrow: 1,
          bgcolor: alpha("#f8f9fa", 0.2),
          minWidth: 0,
        }}
      >
        {displayPeer ? (
          <>
            <ChatHeader
              name={displayPeer.name || "Unknown"}
              isOnline={false}
              initials={getInitials(displayPeer.name)}
            />
            <Box
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                py: 3,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Load More Button */}
              {messagesData?.pagination && messagesData.pagination.page < messagesData.pagination.totalPages && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                    onClick={handleLoadMore}
                  >
                    Load More
                  </Typography>
                </Box>
              )}

              {messagesLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : messagesData?.data && messagesData.data.length > 0 ? (
                messagesData.data
                  .slice()
                  .reverse()
                  .map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      id={msg.id}
                      message={msg.content}
                      time={formatTime(msg.createdAt)}
                      isSent={msg.senderId === user?.id}
                    />
                  ))
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                  <Typography variant="body2">
                    No messages yet. Send the first message!
                  </Typography>
                </Box>
              )}
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
      </Box>
    </Box>
  );
}

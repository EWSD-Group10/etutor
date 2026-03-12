"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import MessageIcon from "@mui/icons-material/Message";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import ArticleIcon from "@mui/icons-material/Article";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogout } from "@/app/hooks/auth/useLogout";
import { useAuth } from "@/app/context/AuthContext";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user, isLoading, setUser } = useAuth();

  // Sync with localStorage on mount and when user changes
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user:", error);
        }
      }
    }
  }, [user, setUser]);

  const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Tutors", href: "/admin/tutors", icon: <SchoolIcon /> },
    { label: "Students", href: "/admin/students", icon: <PeopleIcon /> },
    { label: "Allocation", href: "/admin/allocations", icon: <AssignmentIcon /> },
  ];

  const tutorItems = [
    { label: "Dashboard", href: "/tutors/dashboard", icon: <DashboardIcon /> },
    { label: "Students", href: "/tutors/students", icon: <PeopleIcon /> },
    { label: "Messages", href: "/tutors/messages", icon: <MessageIcon /> },
    { label: "Meetings", href: "/tutors/meetings", icon: <EventIcon /> },
    { label: "Documents", href: "/tutors/documents", icon: <DescriptionIcon /> },
    { label: "Blog", href: "/tutors/blog", icon: <ArticleIcon /> },
    { label: "Settings", href: "/tutors/settings", icon: <SettingsIcon /> },
  ];

  const items = user?.role?.toUpperCase() === "ADMIN" ? adminItems : tutorItems;

  // Get initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
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
        width: 240,
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: 1,
        borderColor: "divider",
        zIndex: 1000,
        overflowY: "auto",
      }}
    >
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          {isLoading ? (
            <CircularProgress size={40} sx={{ mx: "auto", mb: 1 }} />
          ) : (
            <>
              <Avatar sx={{ mx: "auto", mb: 1 }}>
                {getInitials(user?.name)}
              </Avatar>
              <Typography variant="subtitle2">{user?.name || "Unknown"}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role?.toLowerCase() || "guest"}
              </Typography>
            </>
          )}
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={logoutMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />}
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          sx={{
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </Box>
    </Box>
  );
};

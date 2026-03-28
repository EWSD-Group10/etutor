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
  alpha,
  Drawer,
  useMediaQuery,
  useTheme,
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
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogout } from "@/app/hooks/auth/useLogout";
import { useAuth } from "@/app/context/AuthContext";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user, isLoading, setUser } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Prefer localStorage so sidebar always shows the actual logged-in user (fixes student seeing wrong name/role)
  const [displayUser, setDisplayUser] = useState<User | null>(user ?? null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User;
        setDisplayUser(parsed);
        if (!user || user.id !== parsed.id) setUser(parsed);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        setDisplayUser(user);
      }
    } else {
      setDisplayUser(user);
    }
  }, [user, setUser]);

  const adminItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Tutors", href: "/admin/tutors", icon: <SchoolIcon /> },
    { label: "Students", href: "/admin/students", icon: <PeopleIcon /> },
    { label: "Allocation", href: "/admin/allocations", icon: <AssignmentIcon /> },
  ];

  const tutorItems = [
    { label: "Dashboard", href: "/tutor/dashboard", icon: <DashboardIcon /> },
    { label: "Students", href: "/tutor/students", icon: <PeopleIcon /> },
    { label: "Messages", href: "/tutor/messages", icon: <MessageIcon /> },
    { label: "Meetings", href: "/tutor/meetings", icon: <EventIcon /> },
    { label: "Blog", href: "/tutor/blog", icon: <ArticleIcon /> },
    { label: "Settings", href: "/tutor/settings", icon: <SettingsIcon /> },
  ];

  const studentItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: <DashboardIcon /> },
    { label: "Messages", href: "/student/messages", icon: <MessageIcon /> },
    { label: "Meetings", href: "/student/meetings", icon: <EventIcon /> },
    { label: "Documents", href: "/student/documents", icon: <DescriptionIcon /> },
    { label: "Blog", href: "/student/blog", icon: <ArticleIcon /> },
    { label: "Notifications", href: "/student/notifications", icon: <NotificationsIcon /> },
    { label: "Settings", href: "/student/settings", icon: <SettingsIcon /> },
  ];

  const role = displayUser?.role?.toUpperCase();
  const items =
    role === "ADMIN" ? adminItems : role === "STUDENT" ? studentItems : tutorItems;

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

  const sidebarContent = (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        bgcolor: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: 1,
        borderColor: alpha("#000", 0.05),
        overflowY: "auto",
        boxShadow: "2px 0px 8px rgba(0, 0, 0, 0.02)",
      }}
    >
      <Box>
        <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ bgcolor: "primary.main", p: 0.5, borderRadius: 1, color: "white" }}>
            <SchoolIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: -0.5 }}>
            eTutor
          </Typography>
        </Box>
        <List sx={{ px: 1.5 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              onClick={onMobileClose}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: pathname === item.href ? "primary.main" : "text.secondary",
                bgcolor: pathname === item.href ? alpha("#1976d2", 0.08) : "transparent",
                "&.Mui-selected": {
                  bgcolor: alpha("#1976d2", 0.08),
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: alpha("#1976d2", 0.12),
                  },
                },
                "&:hover": {
                  bgcolor: alpha("#000", 0.03),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {React.cloneElement(item.icon as React.ReactElement, { fontSize: "small" })}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  variant: "body2", 
                  sx: { fontWeight: pathname === item.href ? 700 : 500 } 
                }} 
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: alpha("#000", 0.05) }}>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          {isLoading ? (
            <CircularProgress size={40} sx={{ mx: "auto", mb: 1 }} />
          ) : (
            <>
              <Avatar 
                sx={{ 
                  mx: "auto", 
                  mb: 1, 
                  width: 52, 
                  height: 52, 
                  bgcolor: alpha("#000", 0.05), 
                  color: "text.secondary",
                  fontSize: "1rem",
                  fontWeight: 700
                }}
              >
                {getInitials(displayUser?.name)}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                {displayUser?.name || "—"}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, textTransform: "lowercase" }}>
                {displayUser?.role || ""}
              </Typography>
            </>
          )}
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={logoutMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />}
          onClick={() => {
            onMobileClose?.();
            logoutMutation.mutate();
          }}
          disabled={logoutMutation.isPending}
          sx={{
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 2,
            py: 1,
            borderColor: alpha("#d32f2f", 0.2),
            "&:hover": {
              bgcolor: alpha("#d32f2f", 0.04),
              borderColor: "#d32f2f",
            }
          }}
        >
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box component="nav">
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240, border: "none" },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            width: 240,
            flexShrink: 0,
          }}
        >
          {sidebarContent}
        </Box>
      )}
    </Box>
  );
};

"use client";

import React from "react";
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
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LogoutIcon from "@mui/icons-material/Logout";
import { useLogout } from "@/app/hooks/auth/useLogout";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const logoutMutation = useLogout();

  const items = [
    { label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> },
    { label: "Tutors", href: "/tutors", icon: <SchoolIcon /> },
    { label: "Students", href: "/students", icon: <PeopleIcon /> },
    { label: "Allocation", href: "/allocation", icon: <AssignmentIcon /> },
  ];

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
          <Avatar sx={{ mx: "auto", mb: 1 }}>AD</Avatar>
          <Typography variant="subtitle2">Admin User</Typography>
          <Typography variant="caption" color="text.secondary">
            admin
          </Typography>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
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

"use client";

import React, { useState } from "react";
import { Box, IconButton, alpha, Typography, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import { Sidebar } from "./components/Sidebar";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          minHeight: "100vh",
          width: isMobile ? "100%" : "calc(100% - 240px)",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {isMobile && (
          <Box
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "white",
              borderBottom: 1,
              borderColor: alpha("#000", 0.05),
              position: "sticky",
              top: 0,
              zIndex: 1100,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: "text.secondary" }}
              >
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ bgcolor: "primary.main", p: 0.5, borderRadius: 1, color: "white", display: "flex" }}>
                  <SchoolIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "primary.main", letterSpacing: -0.5 }}>
                  eTutor
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

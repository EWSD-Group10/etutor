"use client";

import React from "react";
import { Box, Typography, Link, alpha } from "@mui/material";
import NextLink from "next/link";

interface DashboardSectionProps {
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  viewAllHref,
  children,
}) => {
  return (
    <Box
      sx={{
        mb: 3,
        bgcolor: "#fff",
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.07),
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 2,
          borderBottom: "1px solid",
          borderColor: alpha("#000", 0.06),
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          {title}
        </Typography>
        {viewAllHref && (
          <Link
            component={NextLink}
            href={viewAllHref}
            underline="none"
            sx={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All
          </Link>
        )}
      </Box>

      {/* Section content */}
      <Box sx={{ px: 3, py: 1 }}>{children}</Box>
    </Box>
  );
};

export default DashboardSection;

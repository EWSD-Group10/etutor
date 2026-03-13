"use client";

import React from "react";
import { Box, Typography, Button, Link } from "@mui/material";
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
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {viewAllHref && (
          <Link
            component={NextLink}
            href={viewAllHref}
            underline="none"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View All
          </Link>
        )}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

export default DashboardSection;

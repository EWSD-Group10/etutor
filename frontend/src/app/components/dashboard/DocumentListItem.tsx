"use client";

import React from "react";
import { Box, Typography, alpha } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface DocumentListItemProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

/** Single row for recent documents list. */
const DocumentListItem: React.FC<DocumentListItemProps> = ({
  label,
  icon,
  onClick,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        px: 0.5,
        borderBottom: "1px solid",
        borderColor: alpha("#000", 0.06),
        "&:last-of-type": { borderBottom: "none" },
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? { bgcolor: alpha("#1976d2", 0.02) } : {},
        borderRadius: 1,
        transition: "background-color 0.2s",
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: alpha("#7c3aed", 0.1),
            color: "#7c3aed",
            flexShrink: 0,
          }}
        >
          {icon ?? <DescriptionIcon sx={{ fontSize: 18 }} />}
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {label}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: "text.disabled",
        }}
      >
        <TrendingUpIcon sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  );
};

export default DocumentListItem;

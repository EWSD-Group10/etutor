"use client";

import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

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
        py: 1,
        px: 0,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:last-of-type": { borderBottom: "none" },
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? { bgcolor: "action.hover" } : {},
        borderRadius: 1,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ color: "secondary.main" }}>
          {icon ?? <DescriptionIcon fontSize="small" />}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <IconButton size="small" sx={{ p: 0.5 }} aria-label="View">
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default DocumentListItem;

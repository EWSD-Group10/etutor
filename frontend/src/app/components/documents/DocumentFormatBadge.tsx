"use client";

import React from "react";
import { Chip } from "@mui/material";
import type { DocumentFormatCategory } from "./documentFormatUtils";
import { formatCategoryLabel } from "./documentFormatUtils";

const COLORS: Record<DocumentFormatCategory, { bg: string; color: string }> = {
  pdf: { bg: "rgba(211, 47, 47, 0.12)", color: "#c62828" },
  doc: { bg: "rgba(25, 118, 210, 0.12)", color: "#1565c0" },
  xls: { bg: "rgba(46, 125, 50, 0.12)", color: "#2e7d32" },
  ppt: { bg: "rgba(230, 81, 0, 0.12)", color: "#e65100" },
  other: { bg: "rgba(0, 0, 0, 0.06)", color: "#616161" },
};

interface DocumentFormatBadgeProps {
  category: DocumentFormatCategory;
}

const DocumentFormatBadge: React.FC<DocumentFormatBadgeProps> = ({ category }) => {
  const c = COLORS[category];
  return (
    <Chip
      label={formatCategoryLabel(category)}
      size="small"
      sx={{
        height: 24,
        fontWeight: 700,
        fontSize: "0.7rem",
        bgcolor: c.bg,
        color: c.color,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
};

export default DocumentFormatBadge;

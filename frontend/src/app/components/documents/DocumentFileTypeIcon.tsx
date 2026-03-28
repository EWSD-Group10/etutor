"use client";

import React from "react";
import { Box } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import TableChartIcon from "@mui/icons-material/TableChart";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import type { DocumentFormatCategory } from "./documentFormatUtils";

const ICON_BG: Record<DocumentFormatCategory, { bg: string; color: string }> = {
  pdf: { bg: "rgba(211, 47, 47, 0.12)", color: "#c62828" },
  doc: { bg: "rgba(25, 118, 210, 0.12)", color: "#1565c0" },
  xls: { bg: "rgba(46, 125, 50, 0.12)", color: "#2e7d32" },
  ppt: { bg: "rgba(230, 81, 0, 0.12)", color: "#e65100" },
  other: { bg: "rgba(0, 0, 0, 0.06)", color: "#616161" },
};

function IconFor({ category }: { category: DocumentFormatCategory }) {
  switch (category) {
    case "pdf":
      return <PictureAsPdfIcon sx={{ fontSize: 22 }} />;
    case "doc":
      return <ArticleIcon sx={{ fontSize: 22 }} />;
    case "xls":
      return <TableChartIcon sx={{ fontSize: 22 }} />;
    case "ppt":
      return <SlideshowIcon sx={{ fontSize: 22 }} />;
    default:
      return <InsertDriveFileIcon sx={{ fontSize: 22 }} />;
  }
}

interface DocumentFileTypeIconProps {
  category: DocumentFormatCategory;
}

const DocumentFileTypeIcon: React.FC<DocumentFileTypeIconProps> = ({ category }) => {
  const s = ICON_BG[category];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: s.bg,
        color: s.color,
        flexShrink: 0,
      }}
    >
      <IconFor category={category} />
    </Box>
  );
};

export default DocumentFileTypeIcon;

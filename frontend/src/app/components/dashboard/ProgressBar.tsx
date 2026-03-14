"use client";

import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";

interface ProgressBarProps {
  label: string;
  value: number;
  color?: "primary" | "secondary" | "success" | "info";
}

/** Reusable labeled progress bar for course progress etc. */
const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  color = "primary",
}) => {
  return (
    <Box sx={{ mb: 2.5, "&:last-of-type": { mb: 0 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.8,
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.secondary", fontSize: "0.8rem" }}
        >
          {Math.round(value)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        color={color}
        sx={{
          height: 7,
          borderRadius: 4,
          bgcolor: "rgba(0,0,0,0.06)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
};

export default ProgressBar;

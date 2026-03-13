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
    <Box sx={{ mb: 2, "&:last-of-type": { mb: 0 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.main" }}>
          {Math.round(value)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, value))}
        color={color}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": {
            borderRadius: 1,
          },
        }}
      />
    </Box>
  );
};

export default ProgressBar;

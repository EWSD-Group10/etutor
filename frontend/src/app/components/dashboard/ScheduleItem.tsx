"use client";

import React from "react";
import { Box, Typography, Stack, alpha } from "@mui/material";

interface ScheduleItemProps {
  id: string;
  time: string;
  date: string;
  location: string;
  subject: string;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  id,
  time,
  date,
  location,
  subject,
}) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        py: 1.5,
        px: 0.5,
        borderBottom: "1px solid",
        borderColor: alpha("#000", 0.06),
        "&:last-child": { borderBottom: "none" },
      }}
    >
      {/* Time badge */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 56,
          height: 56,
          borderRadius: 2,
          bgcolor: alpha("#1976d2", 0.1),
          color: "#1976d2",
          textAlign: "center",
          px: 0.5,
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: "0.78rem",
            lineHeight: 1.2,
            color: "#1976d2",
          }}
        >
          {time}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.62rem",
            fontWeight: 600,
            color: "#1976d2",
            mt: 0.3,
            opacity: 0.8,
          }}
        >
          {date}
        </Typography>
      </Box>

      {/* Subject & location */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "text.primary", mb: 0.3 }}
        >
          {subject}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          • {location}
        </Typography>
      </Box>
    </Stack>
  );
};

export default ScheduleItem;

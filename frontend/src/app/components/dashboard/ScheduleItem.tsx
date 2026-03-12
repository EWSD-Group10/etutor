"use client";

import React from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  alpha,
} from "@mui/material";

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
    <Card
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          transition: "boxShadow 0.3s ease-in-out",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: alpha("#1976d2", 0.1),
            color: "primary.main",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1 }}>
            {time}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.625rem", color: "text.secondary" }}>
            {date}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {subject}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • {location}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default ScheduleItem;

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
        borderRadius: 3,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
        border: "1px solid",
        borderColor: alpha("#000", 0.05),
        "&:hover": {
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
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
            bgcolor: alpha("#1976d2", 0.08),
            color: "#1976d2",
            textAlign: "center",
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: "0.7rem", lineHeight: 1.2 }}>
            {time}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.6rem", fontWeight: 600, color: "primary.main", mt: 0.2 }}>
            {date}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
            {subject}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            • {location}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default ScheduleItem;

"use client";

import React from "react";
import { Box, Typography, Button, Avatar, alpha } from "@mui/material";
import DashboardCard from "./DashboardCard";
import PersonIcon from "@mui/icons-material/Person";

interface AssignedTutorCardProps {
  tutorName: string;
  department: string;
  initials?: string;
  onViewProfile?: () => void;
}

/** Card showing assigned tutor with avatar and View Profile action. */
const AssignedTutorCard: React.FC<AssignedTutorCardProps> = ({
  tutorName,
  department,
  initials,
  onViewProfile,
}) => {
  const derivedInitials =
    initials ??
    tutorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <DashboardCard title="Assigned Tutor" icon={<PersonIcon />}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.3 }}>
              {tutorName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {department}
            </Typography>
          </Box>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha("#1976d2", 0.12),
              color: "primary.main",
              fontSize: "0.8rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {derivedInitials}
          </Avatar>
        </Box>
        {onViewProfile && (
          <Button
            variant="outlined"
            size="small"
            onClick={onViewProfile}
            fullWidth
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              mt: 0.5,
            }}
          >
            View Profile
          </Button>
        )}
      </Box>
    </DashboardCard>
  );
};

export default AssignedTutorCard;

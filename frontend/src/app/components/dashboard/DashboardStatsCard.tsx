"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Stack,
  alpha,
} from "@mui/material";

interface DashboardStatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
  color?: string;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({
  label,
  value,
  icon,
  isLoading = false,
  color = "primary.main",
}) => {
  return (
    <Card sx={{ minWidth: 200, flex: 1, boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)", borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: alpha(color === "primary.main" ? "#1976d2" : color, 0.1),
              color: color,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography color="textSecondary" variant="body2" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={60} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;

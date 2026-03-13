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
    <Card sx={{ minWidth: 200, flex: 1, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)", borderRadius: 3, border: "1px solid", borderColor: alpha("#000", 0.05) }}>
      <CardContent sx={{ py: "16px !important" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: alpha(color === "primary.main" ? "#1976d2" : color, 0.08),
              color: color,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 26 } })}
          </Box>
          <Box>
            <Typography color="textSecondary" variant="caption" sx={{ fontWeight: 500, mb: 0.2, display: "block" }}>
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={40} height={28} />
            ) : (
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
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

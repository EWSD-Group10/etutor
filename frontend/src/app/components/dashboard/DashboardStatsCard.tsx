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
  color = "#1976d2",
}) => {
  const resolvedColor = color === "primary.main" ? "#1976d2" : color;

  return (
    <Card
      sx={{
        flex: 1,
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.07),
        bgcolor: "#fff",
      }}
    >
      <CardContent sx={{ py: "20px !important", px: "20px !important" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: alpha(resolvedColor, 0.1),
              color: resolvedColor,
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { fontSize: 24 },
            })}
          </Box>
          <Box>
            <Typography
              color="textSecondary"
              variant="body2"
              sx={{
                fontWeight: 500,
                mb: 0.3,
                display: "block",
                fontSize: "0.8rem",
              }}
            >
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={40} height={32} />
            ) : (
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}
              >
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

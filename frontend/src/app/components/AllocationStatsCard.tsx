"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Skeleton,
  Stack,
} from "@mui/material";

interface AllocationStatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const AllocationStatsCard: React.FC<AllocationStatsCardProps> = ({
  label,
  value,
  icon,
  isLoading = false,
}) => {
  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{ color: "primary.main", fontSize: 32 }}>{icon}</Box>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {label}
            </Typography>
            {isLoading ? (
              <Skeleton width={60} height={32} />
            ) : (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AllocationStatsCard;

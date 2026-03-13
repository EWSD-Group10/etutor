"use client";

import React from "react";
import { Card, CardContent, Typography, Box, alpha } from "@mui/material";

interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/** Reusable dashboard widget card with optional top-right icon. */
const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
}) => {
  return (
    <Card
      sx={{
        height: "100%",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.03)",
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.05),
      }}
    >
      <CardContent sx={{ py: 2, px: 2.5, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { fontSize: 22 },
              })}
            </Box>
          )}
        </Box>
        <Box>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;

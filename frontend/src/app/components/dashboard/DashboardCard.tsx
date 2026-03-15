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
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.07),
        bgcolor: "#fff",
      }}
    >
      <CardContent sx={{ py: 2.5, px: 3, "&:last-child": { pb: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "0.8rem",
            }}
          >
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.disabled",
              }}
            >
              {React.cloneElement(icon as React.ReactElement, {
                sx: { fontSize: 20 },
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

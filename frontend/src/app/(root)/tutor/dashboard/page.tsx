"use client";

import React, { useEffect, useState } from "react";
import { Box, Skeleton } from "@mui/material";
import { useAuth } from "@/app/context/AuthContext";
import axios from "@/lib/axios";
import TutorDashboardContent, {
  type TutorDashboardPayload,
} from "@/app/components/dashboard/TutorDashboardContent";

export default function TutorDashboard() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<TutorDashboardPayload | null>(
    null,
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        const response = await axios.get("/api/tutors/me/dashboard");
        setDashboardData(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setDataLoading(false);
      }
    };

    if (!isLoading && user) {
      fetchDashboardData();
    }
  }, [isLoading, user]);

  if (!isLoading && !user) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} />
      </Box>
    );
  }

  return (
    <TutorDashboardContent
      dashboardData={dashboardData}
      dataLoading={dataLoading}
      headerLoading={isLoading}
      displayName={user?.name ?? ""}
      previewMode={false}
    />
  );
}

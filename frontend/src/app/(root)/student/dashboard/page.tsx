"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import axios from "@/lib/axios";
import StudentDashboardContent, {
  type StudentDashboardPayload,
} from "@/app/components/dashboard/StudentDashboardContent";

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<StudentDashboardPayload | null>(
    null,
  );
  const [dataLoading, setDataLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        const response = await axios.get("/api/students/me/dashboard");
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

  const firstName = user?.name?.split(" ")[0] ?? "";

  return (
    <StudentDashboardContent
      dashboardData={dashboardData}
      dataLoading={dataLoading}
      headerLoading={isLoading}
      greetingName={firstName}
      previewMode={false}
    />
  );
}

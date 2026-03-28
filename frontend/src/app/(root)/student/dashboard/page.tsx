"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Button, alpha, Skeleton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "@/app/context/AuthContext";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import AssignedTutorCard from "@/app/components/dashboard/AssignedTutorCard";
import ProgressBar from "@/app/components/dashboard/ProgressBar";
import DocumentListItem from "@/app/components/dashboard/DocumentListItem";
import axios from "@/lib/axios";

interface DashboardData {
  gpa: number;
  percentileRank: number;
  nextMeeting: {
    id: string;
    time: string;
    location: string;
    type: string;
  } | null;
  assignedTutor: {
    id: string;
    name: string;
    department: string;
  } | null;
  recentDocuments: Array<{
    id: string;
    label: string;
  }>;
  courseProgress: Array<{
    label: string;
    value: number;
  }>;
}

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
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
  const degreeProgram =
    (user as { degreeProgram?: string })?.degreeProgram ?? "Computer Science";
  const yearLabel = "Year 2";

  const recentDocuments = dashboardData?.recentDocuments || [];
  const courses = dashboardData?.courseProgress || [];
  const nextMeeting = dashboardData?.nextMeeting;
  const assignedTutor = dashboardData?.assignedTutor;
  const gpa = dashboardData?.gpa || 0;
  const percentileRank = dashboardData?.percentileRank || 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          {isLoading ? (
            <>
              <Skeleton width={180} height={36} sx={{ mb: 0.3 }} />
              <Skeleton width={220} height={22} />
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3 }}>
                Hi, {firstName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {degreeProgram} • {yearLabel}
              </Typography>
            </>
          )}
        </Box>
        <Button
          variant="contained"
          href="/student/messages"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          }}
        >
          Contact Tutor
        </Button>
      </Box>

      {/* Top row: Current GPA, Next Meeting, Assigned Tutor */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Current GPA" icon={<TrendingUpIcon />}>
            {dataLoading ? (
              <Skeleton variant="rectangular" height={52} sx={{ mb: 1 }} />
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 52,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha("#1976d2", 0.06),
                    borderRadius: 2,
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "primary.main",
                  }}
                >
                  {gpa.toFixed(2)}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Top {percentileRank}% of your class
                </Typography>
              </Box>
            )}
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Next Meeting" icon={<EventIcon />}>
            {dataLoading ? (
              <Skeleton variant="rectangular" height={40} />
            ) : nextMeeting ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {nextMeeting.time}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nextMeeting.location}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming meetings
              </Typography>
            )}
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {dataLoading ? (
            <Skeleton
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 2 }}
            />
          ) : assignedTutor ? (
            <AssignedTutorCard
              tutorName={assignedTutor.name}
              department={assignedTutor.department}
              initials={assignedTutor.name
                .split(" ")
                .map((n) => n.charAt(0))
                .join("")}
              onViewProfile={() => {}}
            />
          ) : (
            <Box
              sx={{
                bgcolor: "#f5f6fa",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No tutor assigned yet
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Bottom row: Recent Documents, Course Progress */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection
            title="Recent Documents"
            viewAllHref="/student/documents"
          >
            {dataLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                ))}
              </>
            ) : recentDocuments.length > 0 ? (
              recentDocuments.map((doc) => (
                <DocumentListItem key={doc.id} label={doc.label} />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
              >
                No documents yet
              </Typography>
            )}
          </DashboardSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection title="Course Progress">
            {dataLoading ? (
              <>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={48}
                    sx={{ mb: 1 }}
                  />
                ))}
              </>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <ProgressBar
                  key={course.label}
                  label={course.label}
                  value={course.value}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 2 }}
              >
                No courses assigned yet
              </Typography>
            )}
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}

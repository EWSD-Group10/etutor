"use client";

import React from "react";
import { Box, Typography, Grid, Button, alpha, Skeleton } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "@/app/context/AuthContext";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import AssignedTutorCard from "@/app/components/dashboard/AssignedTutorCard";
import ProgressBar from "@/app/components/dashboard/ProgressBar";
import DocumentListItem from "@/app/components/dashboard/DocumentListItem";

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();

  const firstName = user?.name?.split(" ")[0] ?? "";
  const degreeProgram =
    (user as { degreeProgram?: string })?.degreeProgram ?? "Computer Science";
  const yearLabel = "Year 2";

  const courses = [
    { label: "Algorithms & Data Structures", value: 85 },
    { label: "Database Systems", value: 72 },
    { label: "Web Development", value: 94 },
  ];

  const recentDocuments = [
    { id: "1", label: "Assignment 1 - Feedback" },
    { id: "2", label: "Mid-term Report" },
    { id: "3", label: "Project Proposal" },
  ];

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
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 28, color: "primary.main" }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Top 10% of your class
              </Typography>
            </Box>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Next Meeting" icon={<EventIcon />}>
            <Typography variant="body2" color="text.secondary">
              No upcoming meetings
            </Typography>
          </DashboardCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <AssignedTutorCard
            tutorName="Dr. Sarah Jenkins"
            department="Computer Science Dept."
            initials="SJ"
            onViewProfile={() => {}}
          />
        </Grid>
      </Grid>

      {/* Bottom row: Recent Documents, Course Progress */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection
            title="Recent Documents"
            viewAllHref="/student/documents"
          >
            {recentDocuments.map((doc) => (
              <DocumentListItem key={doc.id} label={doc.label} />
            ))}
          </DashboardSection>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardSection title="Course Progress">
            {courses.map((course) => (
              <ProgressBar
                key={course.label}
                label={course.label}
                value={course.value}
              />
            ))}
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}

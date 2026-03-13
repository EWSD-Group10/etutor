"use client";

import React from "react";
import { Box, Typography, Grid, Button } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import EventIcon from "@mui/icons-material/Event";
import { useAuth } from "@/app/context/AuthContext";
import DashboardCard from "@/app/components/dashboard/DashboardCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import AssignedTutorCard from "@/app/components/dashboard/AssignedTutorCard";
import ProgressBar from "@/app/components/dashboard/ProgressBar";
import DocumentListItem from "@/app/components/dashboard/DocumentListItem";

export default function StudentDashboard() {
  const { user } = useAuth();

  const firstName = user?.name?.split(" ")[0] || "Student";
  const degreeProgram = (user as { degreeProgram?: string })?.degreeProgram || "Computer Science";
  const yearLabel = "Year 2";

  const courses = [
    { label: "Algorithms & Data Structures", value: 85 },
    { label: "Database Systems", value: 72 },
    { label: "Web Development", value: 94 },
  ];

  const recentDocuments = [
    { id: "1", label: "Invalid Date" },
    { id: "2", label: "Invalid Date" },
    { id: "3", label: "Invalid Date" },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          px: { xs: 1, md: 2 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Hi, {firstName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {degreeProgram} • {yearLabel}
          </Typography>
        </Box>
        <Button
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 600 }}
          href="/student/messages"
        >
          Contact Tutor
        </Button>
      </Box>

      {/* First row: Current GPA, Next Meeting, Assigned Tutor */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <DashboardCard
            title="Current GPA"
            icon={<TrendingUpIcon />}
          >
            <Box
              sx={{
                height: 56,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                borderRadius: 2,
                mb: 1,
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 32, color: "primary.main" }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Top 10% of your class
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardCard title="Next Meeting" icon={<EventIcon />}>
            <Typography variant="body2" color="text.secondary">
              No upcoming meetings
            </Typography>
          </DashboardCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AssignedTutorCard
            tutorName="Dr. Sarah Jenkins"
            department="Computer Science Dept."
            initials="SJ"
            onViewProfile={() => {}}
          />
        </Grid>
      </Grid>

      {/* Second row: Recent Documents, Course Progress */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <DashboardSection title="Recent Documents" viewAllHref="/student/documents">
            <Box sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              {recentDocuments.map((doc) => (
                <DocumentListItem key={doc.id} label={doc.label} />
              ))}
            </Box>
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardSection title="Course Progress">
            <Box sx={{ bgcolor: "background.paper", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
              {courses.map((course) => (
                <ProgressBar
                  key={course.label}
                  label={course.label}
                  value={course.value}
                />
              ))}
            </Box>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}

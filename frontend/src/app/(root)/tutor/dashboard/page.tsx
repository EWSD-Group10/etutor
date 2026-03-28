"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Stack, Skeleton } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import MessageIcon from "@mui/icons-material/Message";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import DashboardSection from "@/app/components/dashboard/DashboardSection";
import StudentListItem from "@/app/components/dashboard/StudentListItem";
import ScheduleItem from "@/app/components/dashboard/ScheduleItem";
import MessageItem from "@/app/components/dashboard/MessageItem";
import { useAuth } from "@/app/context/AuthContext";
import axios from "@/lib/axios";

interface DashboardData {
  studentsCount: number;
  upcomingMeetingsCount: number;
  upcomingMeetings: Array<{
    id: string;
    time: string;
    date: string;
    location: string;
    subject: string;
  }>;
  unreadMessagesCount: number;
  recentMessages: Array<{
    id: string;
    sender: string;
    message: string;
    unreadCount: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    engagement: number;
  }>;
  avgGPA: number;
}

export default function TutorDashboard() {
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

  const students = dashboardData?.students || [];
  const schedule = dashboardData?.upcomingMeetings || [];
  const messages = dashboardData?.recentMessages || [];
  const studentsCount = dashboardData?.studentsCount || 0;
  const upcomingMeetingsCount = dashboardData?.upcomingMeetingsCount || 0;
  const unreadMessagesCount = dashboardData?.unreadMessagesCount || 0;
  const avgGPA = dashboardData?.avgGPA || 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: "#f5f6fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {isLoading ? (
          <Skeleton width={260} height={36} sx={{ mb: 0.5 }} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Welcome back, {user?.name ?? ""}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Here&apos;s what&apos;s happening with your students today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="My Students"
              value={studentsCount.toString()}
              icon={<PeopleIcon />}
              color="#1976d2"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Upcoming Meetings"
              value={upcomingMeetingsCount.toString()}
              icon={<EventIcon />}
              color="#9c27b0"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Unread Messages"
              value={unreadMessagesCount.toString()}
              icon={<MessageIcon />}
              color="#2e7d32"
            />
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          {dataLoading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : (
            <DashboardStatsCard
              label="Avg GPA"
              value={avgGPA.toFixed(1)}
              icon={<MenuBookIcon />}
              color="#ed6c02"
            />
          )}
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column — My Students */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <DashboardSection title="My Students" viewAllHref="/tutor/students">
            <Stack>
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
              ) : students.length > 0 ? (
                students.map((student) => (
                  <StudentListItem
                    key={student.id}
                    id={student.id}
                    name={student.name}
                    engagement={student.engagement}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No students assigned yet
                </Typography>
              )}
            </Stack>
          </DashboardSection>
        </Grid>

        {/* Right Column — Schedule & Messages */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <DashboardSection title="Today's Schedule">
            <Stack>
              {dataLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={48}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </>
              ) : schedule.length > 0 ? (
                schedule.map((item) => (
                  <ScheduleItem
                    key={item.id}
                    id={item.id}
                    time={item.time}
                    date={item.date}
                    location={item.location}
                    subject={item.subject}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No scheduled meetings
                </Typography>
              )}
            </Stack>
          </DashboardSection>

          <DashboardSection title="Recent Messages">
            <Stack>
              {dataLoading ? (
                <>
                  {[...Array(2)].map((_, i) => (
                    <Skeleton
                      key={i}
                      variant="rectangular"
                      height={48}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </>
              ) : messages.length > 0 ? (
                messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    id={message.id}
                    sender={message.sender}
                    message={message.message}
                    unreadCount={message.unreadCount}
                  />
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  align="center"
                  sx={{ py: 2 }}
                >
                  No messages yet
                </Typography>
              )}
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}

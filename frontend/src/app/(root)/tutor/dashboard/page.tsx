"use client";

import React from "react";
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

export default function TutorDashboard() {
  const { user, isLoading } = useAuth();

  const students = [
    { id: "1", name: "Oliver Smith", engagement: 10 },
    { id: "2", name: "Emma Jones", engagement: 13 },
    { id: "3", name: "Harry Williams", engagement: 91 },
    { id: "4", name: "Sophia Brown", engagement: 24 },
    { id: "5", name: "George Taylor", engagement: 29 },
    { id: "6", name: "Isabella Davies", engagement: 0 },
    { id: "7", name: "Jack Evans", engagement: 95 },
    { id: "8", name: "Mia Thomas", engagement: 3 },
  ];

  const schedule = [
    {
      id: "1",
      time: "09:00",
      date: "Mar 13",
      location: "Room 304",
      subject: "Mathematics",
    },
    {
      id: "2",
      time: "11:30",
      date: "Mar 13",
      location: "Online",
      subject: "Physics",
    },
    {
      id: "3",
      time: "14:00",
      date: "Mar 13",
      location: "Office 101",
      subject: "Mentoring Session",
    },
  ];

  const messages = [
    {
      id: "1",
      sender: "Oliver Smith",
      message: "Can we reschedule our next session?",
      unreadCount: 2,
    },
    {
      id: "2",
      sender: "Emma Jones",
      message: "Thanks for the feedback on my assignment!",
      unreadCount: 0,
    },
  ];

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
          <DashboardStatsCard
            label="My Students"
            value="8"
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Upcoming Meetings"
            value="3"
            icon={<EventIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Unread Messages"
            value="2"
            icon={<MessageIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Avg GPA"
            value="3.4"
            icon={<MenuBookIcon />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column — My Students */}
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <DashboardSection title="My Students" viewAllHref="/tutor/student">
            <Stack>
              {students.map((student) => (
                <StudentListItem
                  key={student.id}
                  id={student.id}
                  name={student.name}
                  engagement={student.engagement}
                />
              ))}
            </Stack>
          </DashboardSection>
        </Grid>

        {/* Right Column — Schedule & Messages */}
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <DashboardSection title="Today's Schedule">
            <Stack>
              {schedule.map((item) => (
                <ScheduleItem
                  key={item.id}
                  id={item.id}
                  time={item.time}
                  date={item.date}
                  location={item.location}
                  subject={item.subject}
                />
              ))}
            </Stack>
          </DashboardSection>

          <DashboardSection title="Recent Messages">
            <Stack>
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  id={message.id}
                  sender={message.sender}
                  message={message.message}
                  unreadCount={message.unreadCount}
                />
              ))}
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </Box>
  );
}

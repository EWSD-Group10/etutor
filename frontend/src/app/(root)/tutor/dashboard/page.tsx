"use client";

import React from "react";
import { Box, Typography, Grid, Stack } from "@mui/material";
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
  const { user } = useAuth();

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
    { id: "1", time: "09:00", date: "Mar 13", location: "Room 304", subject: "Mathematics" },
    { id: "2", time: "11:30", date: "Mar 13", location: "Online", subject: "Physics" },
    { id: "3", time: "14:00", date: "Mar 13", location: "Office 101", subject: "Mentoring Session" },
  ];

  const messages = [
    { id: "1", sender: "Oliver Smith", message: "Can we reschedule our next session?", unreadCount: 2 },
    { id: "2", sender: "Emma Jones", message: "Thanks for the feedback on my assignment!", unreadCount: 0 },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Box sx={{ mb: 4, px: { xs: 1, md: 2 } }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome back, {user?.name || "Dr. Sarah Chen"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your students today.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="My Students"
            value="8"
            icon={<PeopleIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Upcoming Meetings"
            value="3"
            icon={<EventIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Unread Messages"
            value="2"
            icon={<MessageIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Avg GPA"
            value="3.4"
            icon={<MenuBookIcon />}
            color="#ed6c02"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Left Column - My Students */}
        <Grid item xs={12} md={7} lg={8}>
          <DashboardSection title="My Students" viewAllHref="/tutor/student">
            <Stack spacing={1}>
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

        {/* Right Column - Schedule and Messages */}
        <Grid item xs={12} md={5} lg={4}>
          <DashboardSection title="Today's Schedule">
            <Stack spacing={1}>
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
            <Stack spacing={1}>
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

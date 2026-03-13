"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Stack,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import MeetingListItem, {
  MeetingStatus,
  MeetingType,
} from "@/app/components/meetings/MeetingListItem";

const meetingsData = [
  {
    id: "1",
    title: "Weekly Progress Review",
    date: { day: "13", month: "Mar" },
    time: "03:06 PM",
    duration: "30 min",
    location: "Room 304",
    participant: "Dr. Sarah Jenkins",
    status: "scheduled" as MeetingStatus,
    type: "in person" as MeetingType,
  },
  {
    id: "2",
    title: "Dissertation Discussion",
    date: { day: "11", month: "Mar" },
    time: "03:06 PM",
    duration: "45 min",
    location: "zoom.us/j/123456789",
    link: "https://zoom.us/j/123456789",
    participant: "Dr. Sarah Jenkins",
    status: "completed" as MeetingStatus,
    type: "virtual" as MeetingType,
  },
  {
    id: "3",
    title: "Pastoral Care Check-in",
    date: { day: "10", month: "Mar" },
    time: "03:06 PM",
    duration: "20 min",
    location: "Office 101",
    participant: "Dr. Sarah Jenkins",
    status: "cancelled" as MeetingStatus,
    type: "in person" as MeetingType,
  },
];

export default function StudentMeetingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const filteredMeetings = meetingsData.filter((meeting) => {
    const matchesTab = activeTab === "all" || meeting.status === activeTab;
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.participant.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
          >
            Meetings
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            View and join your meetings with your tutor
          </Typography>
        </Box>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Total Meetings"
            value="3"
            icon={<EventIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Scheduled"
            value="1"
            icon={<AccessTimeIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Completed"
            value="1"
            icon={<CheckCircleOutlineIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardStatsCard
            label="Cancelled"
            value="1"
            icon={<CancelOutlinedIcon />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          bgcolor: "white",
          p: 1.5,
          borderRadius: 4,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.02)",
          border: "1px solid",
          borderColor: alpha("#000", 0.05),
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: 2,
              px: 3,
              mr: 1,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
                bgcolor: alpha("#1976d2", 0.08),
              },
            },
          }}
        >
          <Tab value="all" label="All" />
          <Tab value="scheduled" label="Scheduled" />
          <Tab value="completed" label="Completed" />
          <Tab value="cancelled" label="Cancelled" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 300,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              bgcolor: alpha("#000", 0.02),
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "transparent" },
              "&.Mui-focused fieldset": { borderColor: "transparent" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Meeting List */}
      <Stack spacing={0}>
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <MeetingListItem
              key={meeting.id}
              {...meeting}
              onView={(id) => console.log("View", id)}
              viewOnly
            />
          ))
        ) : (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
              bgcolor: "white",
              borderRadius: 4,
              border: "1px dashed",
              borderColor: alpha("#000", 0.1),
            }}
          >
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              No meetings found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Try adjusting your filters or search query
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

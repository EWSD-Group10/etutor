"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Pagination,
} from "@mui/material";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import MeetingListItem from "@/app/components/meetings/MeetingListItem";
import { ScheduleMeetingDialog } from "@/app/components/meetings/ScheduleMeetingDialog";
import { EditMeetingDialog } from "@/app/components/meetings/EditMeetingDialog";
import { MeetingDetailsDialog } from "@/app/components/meetings/MeetingDetailsDialog";
import { useMeetings, MeetingStatus } from "@/app/hooks/meetings/useMeetings";
import {
  useCreateMeeting,
  useUpdateMeeting,
} from "@/app/hooks/meetings/useMeetingMutations";
import {
  CreateMeetingInput,
  Meeting,
  UpdateMeetingInput,
} from "@/app/hooks/meetings/query";

type TabValue = "all" | MeetingStatus;

export default function TutorMeetingsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [confirmMeetingOpen, setConfirmMeetingOpen] = useState(false);
  const [confirmMeetingId, setConfirmMeetingId] = useState<string | null>(null);
  const [confirmMeetingStatus, setConfirmMeetingStatus] = useState<
    "completed" | "cancelled" | null
  >(null);
  const [confirmMeetingMessage, setConfirmMeetingMessage] = useState("");

  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();

  // Determine status filter based on tab
  const statusFilter = activeTab === "all" ? undefined : activeTab;

  // Fetch meetings with pagination
  const { data: meetingsData, isLoading } = useMeetings(page, 20, statusFilter);

  // Calculate stats from data
  const allMeetings = meetingsData?.data || [];
  const totalMeetings = allMeetings.length;
  const scheduledCount = allMeetings.filter(
    (m) => m.meetingStatus === "scheduled",
  ).length;
  const completedCount = allMeetings.filter(
    (m) => m.meetingStatus === "completed",
  ).length;
  const cancelledCount = allMeetings.filter(
    (m) => m.meetingStatus === "cancelled",
  ).length;

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: TabValue,
  ) => {
    setActiveTab(newValue);
    setPage(1); // Reset to first page when changing tabs
  };

  const pagination = meetingsData?.pagination;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setPage(value);
  };

  const handleConfirmMeeting = () => {
    if (!confirmMeetingId || !confirmMeetingStatus) {
      setConfirmMeetingOpen(false);
      return;
    }

    updateMeeting.mutate({
      meetingId: confirmMeetingId,
      input: { meetingStatus: confirmMeetingStatus },
    });
    setConfirmMeetingOpen(false);
    setConfirmMeetingId(null);
    setConfirmMeetingStatus(null);
  };

  // Filter by search query (client-side)
  const filteredMeetings = allMeetings.filter((meeting) => {
    const studentName = meeting.student?.name || "";
    const tutorName = meeting.tutor?.name || "";
    const searchLower = searchQuery.toLowerCase();
    return (
      studentName.toLowerCase().includes(searchLower) ||
      tutorName.toLowerCase().includes(searchLower) ||
      meeting.notes?.toLowerCase().includes(searchLower)
    );
  });

  const handleViewMeeting = (id: string) => {
    const m = filteredMeetings.find((x) => x.id === id) ?? null;
    setSelectedMeeting(m);
    setDetailsDialogOpen(true);
  };

  const handleEditMeeting = (id: string) => {
    const m = filteredMeetings.find((x) => x.id === id) ?? null;
    setSelectedMeeting(m);
    setDetailsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleOpenEditFromDetails = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setDetailsDialogOpen(false);
    setEditDialogOpen(true);
  };

  const handleCancelMeeting = (meetingId: string) => {
    updateMeeting.mutate({ meetingId, input: { meetingStatus: "cancelled" } });
    setDetailsDialogOpen(false);
  };

  const handleSaveEdit = (meetingId: string, input: UpdateMeetingInput) => {
    updateMeeting.mutate({ meetingId, input });
    setEditDialogOpen(false);
    setSelectedMeeting(null);
  };

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
            Schedule and manage meetings
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setScheduleDialogOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.2)",
          }}
        >
          Schedule Meeting
        </Button>
      </Box>

      <ScheduleMeetingDialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        onSubmit={(data: CreateMeetingInput) => createMeeting.mutate(data)}
        isLoading={createMeeting.isPending}
        role="tutor"
      />

      <MeetingDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        onEdit={handleOpenEditFromDetails}
        onCancel={handleCancelMeeting}
        isCancelling={updateMeeting.isPending}
      />

      <EditMeetingDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        onSubmit={handleSaveEdit}
        isLoading={updateMeeting.isPending}
      />

      <ConfirmationDialog
        open={confirmMeetingOpen}
        title="Confirm meeting action"
        message={confirmMeetingMessage}
        confirmLabel="Confirm"
        confirmColor="primary"
        onClose={() => setConfirmMeetingOpen(false)}
        onConfirm={handleConfirmMeeting}
      />

      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Total Meetings"
            value={String(totalMeetings)}
            icon={<EventIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Scheduled"
            value={String(scheduledCount)}
            icon={<AccessTimeIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Completed"
            value={String(completedCount)}
            icon={<CheckCircleOutlineIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <DashboardStatsCard
            label="Cancelled"
            value={String(cancelledCount)}
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
          borderColor: "#00000005",
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
                bgcolor: "#1976d20d",
              },
            },
          }}
        >
          <Tab value="all" label="All" />
          <Tab value="pending" label="Pending" />
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
              bgcolor: "#00000005",
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
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={0}>
          {filteredMeetings.length > 0 ? (
            <>
              {filteredMeetings.map((meeting) => (
                <MeetingListItem
                  key={meeting.id}
                  id={meeting.id}
                  title={meeting.notes || "Meeting"}
                  date={{
                    day: new Date(meeting.scheduledAt).getDate().toString(),
                    month: new Date(meeting.scheduledAt).toLocaleString(
                      "default",
                      { month: "short" },
                    ),
                  }}
                  time={new Date(meeting.scheduledAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  duration={`${meeting.durationMinutes} min`}
                  location={
                    meeting.location || meeting.meetingLink || "No location"
                  }
                  participant={meeting.student?.name || "Unknown"}
                  status={meeting.meetingStatus as MeetingStatus}
                  type={
                    meeting.meetingType === "virtual" ? "virtual" : "in person"
                  }
                  onView={handleViewMeeting}
                  onEdit={handleEditMeeting}
                  onComplete={(id) => {
                    setConfirmMeetingId(id);
                    setConfirmMeetingStatus("completed");
                    setConfirmMeetingMessage(
                      "Are you sure you want to mark this meeting as completed?",
                    );
                    setConfirmMeetingOpen(true);
                  }}
                  onCancel={(id) => {
                    setConfirmMeetingId(id);
                    setConfirmMeetingStatus("cancelled");
                    setConfirmMeetingMessage(
                      "Are you sure you want to cancel this meeting?",
                    );
                    setConfirmMeetingOpen(true);
                  }}
                />
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Box
              sx={{
                p: 8,
                textAlign: "center",
                bgcolor: "white",
                borderRadius: 4,
                border: "1px dashed",
                borderColor: "#0000001a",
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
      )}
    </Box>
  );
}

"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Chip,
  Divider,
  alpha,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import DescriptionIcon from "@mui/icons-material/Description";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/app/hooks/notifications/useNotifications";
import { useUpdateMeeting } from "@/app/hooks/meetings/useMeetingMutations";
import {
  Notification,
  NotificationFilter,
  NotificationMetadata,
} from "@/app/hooks/notifications/query";

type TabValue = NotificationFilter;

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "0m ago";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "student_assigned":
      return { icon: <PersonIcon />, bg: "#1976d2" };
    case "meeting_scheduled":
      return { icon: <EventIcon />, bg: "#7b1fa2" };
    case "meeting_accepted":
      return { icon: <CheckCircleIcon />, bg: "#2e7d32" };
    case "meeting_rejected":
      return { icon: <CloseIcon />, bg: "#d32f2f" };
    case "new_document":
      return { icon: <DescriptionIcon />, bg: "#2e7d32" };
    default:
      return { icon: <NotificationsIcon />, bg: "#1976d2" };
  }
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onMeetingAction: (meetingId: string, status: "completed" | "cancelled") => void;
  isMeetingUpdating: boolean;
}

function NotificationItem({
  notification,
  onRead,
  onMeetingAction,
  isMeetingUpdating,
}: NotificationItemProps) {
  const { icon, bg } = getNotificationIcon(notification.type);
  const meta = notification.metadata as NotificationMetadata | null;

  // Tutor sees Accept/Reject for unread meeting_scheduled notifications from students
  const isPendingMeeting =
    notification.type === "meeting_scheduled" &&
    meta?.meetingStatus === "scheduled" &&
    !notification.isRead;

  const getStatusBadge = () => {
    if (notification.type === "meeting_accepted") {
      return (
        <Chip
          label="accepted"
          size="small"
          sx={{
            bgcolor: alpha("#2e7d32", 0.1),
            color: "#2e7d32",
            fontWeight: 600,
            fontSize: "0.75rem",
            border: "1px solid",
            borderColor: alpha("#2e7d32", 0.2),
          }}
        />
      );
    }
    if (notification.type === "meeting_rejected") {
      return (
        <Chip
          label="rejected"
          size="small"
          sx={{
            bgcolor: alpha("#d32f2f", 0.1),
            color: "#d32f2f",
            fontWeight: 600,
            fontSize: "0.75rem",
            border: "1px solid",
            borderColor: alpha("#d32f2f", 0.2),
          }}
        />
      );
    }
    if (notification.type === "meeting_scheduled" && notification.isRead) {
      return null;
    }
    return null;
  };

  return (
    <>
      <Box
        onClick={() => { if (!notification.isRead) onRead(notification.id); }}
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 2,
          px: 3,
          py: 2.5,
          cursor: notification.isRead ? "default" : "pointer",
          bgcolor: "white",
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: notification.isRead ? "white" : alpha("#1976d2", 0.02) },
          position: "relative",
        }}
      >
        {/* Unread indicator */}
        {!notification.isRead && (
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 3,
              bgcolor: "primary.main",
              borderRadius: "0 2px 2px 0",
            }}
          />
        )}

        {/* Icon */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: alpha(bg, 0.15),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 22, color: bg } })}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: notification.isRead ? 500 : 700, color: "text.primary", mb: 0.25 }}
          >
            {notification.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
            {notification.message}
          </Typography>

          {/* Meeting details for pending meetings */}
          {isPendingMeeting && meta && (
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                bgcolor: alpha("#000", 0.02),
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha("#000", 0.06),
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {meta.scheduledAt && (
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Date
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    &nbsp;&nbsp;
                    {new Date(meta.scheduledAt).toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              )}
              {meta.meetingType && (
                <Box sx={{ minWidth: 120 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    &nbsp;&nbsp;{meta.meetingType}
                  </Typography>
                </Box>
              )}
              {meta.location && (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Location
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    &nbsp;&nbsp;{meta.location}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Right side: time + badge/actions */}
        <Box
          sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 13, color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
              {formatTimeAgo(notification.createdAt)}
            </Typography>
          </Box>

          {getStatusBadge()}

          {isPendingMeeting && meta?.meetingId && (
            <Stack direction="column" spacing={0.5} sx={{ mt: 0.5 }}>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
                disabled={isMeetingUpdating}
                onClick={() => {
                  onMeetingAction(meta.meetingId!, "completed");
                  onRead(notification.id);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  py: 0.5,
                  px: 1.5,
                  minWidth: 90,
                }}
              >
                Accept
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                disabled={isMeetingUpdating}
                onClick={() => {
                  onMeetingAction(meta.meetingId!, "cancelled");
                  onRead(notification.id);
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  py: 0.5,
                  px: 1.5,
                  minWidth: 90,
                }}
              >
                Reject
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
}

export default function TutorNotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useNotifications(activeTab, searchQuery || undefined);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const updateMeeting = useUpdateMeeting();

  const notifications = data?.data ?? [];
  const stats = data?.stats ?? { total: 0, unread: 0, pendingActions: 0 };

  const handleMeetingAction = (meetingId: string, status: "completed" | "cancelled") => {
    updateMeeting.mutate({ meetingId, input: { meetingStatus: status } });
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Stay updated on student assignments, meetings, and more
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<CheckCircleIcon />}
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || stats.unread === 0}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            borderColor: alpha("#000", 0.15),
            color: "text.primary",
            "&:hover": { borderColor: alpha("#000", 0.3), bgcolor: alpha("#000", 0.02) },
          }}
        >
          Mark All Read
        </Button>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <Box sx={{ flex: "1 1 200px" }}>
          <DashboardStatsCard
            label="Total Notifications"
            value={String(stats.total)}
            icon={<NotificationsIcon />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: "1 1 200px" }}>
          <DashboardStatsCard
            label="Unread"
            value={String(stats.unread)}
            icon={<NotificationsActiveIcon />}
            color="#1976d2"
          />
        </Box>
        <Box sx={{ flex: "1 1 200px" }}>
          <DashboardStatsCard
            label="Pending Actions"
            value={String(stats.pendingActions)}
            icon={<AccessTimeIcon />}
            color="#ed6c02"
          />
        </Box>
      </Box>

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
          boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
          border: "1px solid",
          borderColor: "#00000005",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, v) => setActiveTab(v)}
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: 2,
              px: 2,
              mr: 0.5,
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main", bgcolor: "#1976d20d" },
            },
          }}
        >
          <Tab value="all" label="all" />
          <Tab value="unread" label="unread" />
          <Tab value="allocations" label="allocations" />
          <Tab value="meetings" label="meetings" />
          <Tab value="documents" label="documents" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 260,
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

      {/* Notification List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : notifications.length > 0 ? (
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha("#000", 0.05),
            overflow: "hidden",
          }}
        >
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => markRead.mutate(id)}
              onMeetingAction={handleMeetingAction}
              isMeetingUpdating={updateMeeting.isPending}
            />
          ))}
        </Box>
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
          <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 600 }}>
            No notifications found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            You&apos;re all caught up!
          </Typography>
        </Box>
      )}
    </Box>
  );
}

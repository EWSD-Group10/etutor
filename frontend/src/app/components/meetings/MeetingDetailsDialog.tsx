"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
  Chip,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RoomIcon from "@mui/icons-material/Room";
import LinkIcon from "@mui/icons-material/Link";
import GroupIcon from "@mui/icons-material/Group";
import { Meeting } from "@/app/hooks/meetings/query";

interface MeetingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onEdit: (meeting: Meeting) => void;
  onCancel: (meetingId: string) => void;
  isCancelling?: boolean;
}

const statusColor: Record<string, string> = {
  scheduled: "#1976d2",
  completed: "#2e7d32",
  cancelled: "#d32f2f",
};

export const MeetingDetailsDialog: React.FC<MeetingDetailsDialogProps> = ({
  open,
  onClose,
  meeting,
  onEdit,
  onCancel,
  isCancelling = false,
}) => {
  if (!meeting) return null;

  const createdDate = meeting.createdAt
    ? new Date(meeting.createdAt).toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const scheduledDate = meeting.scheduledAt
    ? new Date(meeting.scheduledAt).toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
    : "—";
  const timeAndDuration = meeting.scheduledAt
    ? `${new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} (${meeting.durationMinutes ?? 0} mins)`
    : "—";
  const locationDisplay =
    meeting.meetingType === "virtual"
      ? meeting.meetingLink || "—"
      : meeting.location || "—";
  const participants = [meeting.student].filter(Boolean);
  const showCancelButton = meeting.meetingStatus !== "cancelled";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: "1.25rem",
        }}
      >
        Meeting Details
        <IconButton aria-label="close" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {meeting.notes || "Meeting"}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Created on {createdDate}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Status & Type
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={meeting.meetingStatus}
              size="small"
              sx={{
                fontWeight: 600,
                textTransform: "capitalize",
                bgcolor: alpha(statusColor[meeting.meetingStatus] || "#666", 0.12),
                color: statusColor[meeting.meetingStatus] || "#666",
              }}
            />
            <Chip
              label={meeting.meetingType === "virtual" ? "virtual" : "in person"}
              size="small"
              sx={{
                fontWeight: 500,
                textTransform: "capitalize",
                bgcolor: alpha("#000", 0.06),
                color: "text.secondary",
              }}
            />
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <EventIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="body2">{scheduledDate}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AccessTimeIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="body2">{timeAndDuration}</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {meeting.meetingType === "virtual" ? (
              <LinkIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            ) : (
              <RoomIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            )}
            <Typography variant="body2">{locationDisplay}</Typography>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <GroupIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle2">
              Participants ({participants.length})
            </Typography>
          </Stack>
          <Stack component="ul" sx={{ pl: 2.5, m: 0 }}>
            {participants.map((p) => (
              <Typography key={p.id} component="li" variant="body2" sx={{ listStyle: "disc" }}>
                {p.name}
              </Typography>
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1, gap: 1 }}>
        {showCancelButton && (
          <Button
            variant="contained"
            color="error"
            onClick={() => onCancel(meeting.id)}
            disabled={isCancelling}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            {isCancelling ? "Cancelling..." : "Cancel"}
          </Button>
        )}
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => onEdit(meeting)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

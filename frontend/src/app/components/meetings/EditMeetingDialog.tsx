"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  Stack,
  CircularProgress,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Meeting, UpdateMeetingInput } from "@/app/hooks/meetings/query";

const toISOLocal = (d: Date | string) => {
  const date = typeof d === "string" ? new Date(d) : d;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

interface EditMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (meetingId: string, data: UpdateMeetingInput) => void;
  isLoading?: boolean;
  meeting: Meeting | null;
}

export const EditMeetingDialog: React.FC<EditMeetingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  meeting,
}) => {
  const [notes, setNotes] = useState("");
  const [meetingType, setMeetingType] = useState<"in_person" | "virtual">("in_person");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingStatus, setMeetingStatus] = useState<string>("scheduled");

  useEffect(() => {
    if (open && meeting) {
      setNotes(meeting.notes || "");
      setMeetingType(meeting.meetingType === "virtual" ? "virtual" : "in_person");
      setScheduledAt(toISOLocal(meeting.scheduledAt));
      setDurationMinutes(meeting.durationMinutes ?? 30);
      setLocation(meeting.location || "");
      setMeetingLink(meeting.meetingLink || "");
      setMeetingStatus(meeting.meetingStatus || "scheduled");
    }
  }, [open, meeting]);

  const handleMeetingTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: "in_person" | "virtual" | null
  ) => {
    if (value) setMeetingType(value);
  };

  const handleSubmit = () => {
    if (!meeting) return;
    const at = new Date(scheduledAt).toISOString();
    const payload: UpdateMeetingInput = {
      notes: notes || undefined,
      meetingType: meetingType === "in_person" ? "in_person" : "virtual",
      scheduledAt: at,
      durationMinutes,
      meetingStatus,
    };
    if (meetingType === "in_person") payload.location = location || undefined;
    else payload.meetingLink = meetingLink || undefined;
    onSubmit(meeting.id, payload);
    onClose();
  };

  if (!meeting) return null;

  const participantName = meeting.student?.name || "—";

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
        Edit Meeting
        <IconButton aria-label="close" onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          <TextField
            label="Meeting Name"
            placeholder="e.g. Weekly Progress Review"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            disabled={isLoading}
          />

          <FormControl>
            <FormLabel sx={{ mb: 1 }}>Meeting Type</FormLabel>
            <ToggleButtonGroup
              value={meetingType}
              exclusive
              onChange={handleMeetingTypeChange}
              fullWidth
              sx={{
                "& .MuiToggleButtonGroup-grouped": {
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                },
                "& .Mui-selected": {
                  bgcolor: alpha("#1976d2", 0.12),
                  color: "primary.main",
                  "&:hover": { bgcolor: alpha("#1976d2", 0.18) },
                },
              }}
            >
              <ToggleButton value="in_person">In Person</ToggleButton>
              <ToggleButton value="virtual">Virtual</ToggleButton>
            </ToggleButtonGroup>
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              fullWidth
              disabled={isLoading}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 30)}
              fullWidth
              disabled={isLoading}
              inputProps={{ min: 5, max: 480, step: 5 }}
            />
          </Stack>

          {meetingType === "in_person" ? (
            <TextField
              label="Location"
              placeholder="e.g. Room 304"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
              disabled={isLoading}
            />
          ) : (
            <TextField
              label="Meeting link"
              placeholder="e.g. https://zoom.us/j/123456789"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              fullWidth
              disabled={isLoading}
            />
          )}

          <TextField
            label="Participants"
            value={participantName}
            fullWidth
            disabled
            helperText="Separate multiple names with commas."
          />

          <FormControl fullWidth>
            <FormLabel>Status</FormLabel>
            <Select
              value={meetingStatus}
              onChange={(e) => setMeetingStatus(e.target.value)}
              disabled={isLoading}
              sx={{ mt: 0.5 }}
            >
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

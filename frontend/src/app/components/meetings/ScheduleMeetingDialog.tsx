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
  FormHelperText,
  Stack,
  CircularProgress,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Select, MenuItem } from "@mui/material";
import { CreateMeetingInput } from "@/app/hooks/meetings/query";
import type { TutorStudent } from "@/app/hooks/tutors/query";

export type ScheduleMeetingRole = "tutor" | "student";

interface ScheduleMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMeetingInput) => void;
  isLoading?: boolean;
  role: ScheduleMeetingRole;
  /** For tutor: list of assigned students to pick from. Omit for student. */
  tutorStudents?: TutorStudent[];
  tutorStudentsLoading?: boolean;
}

const toISOLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const defaultScheduledAt = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return toISOLocal(d);
};

export const ScheduleMeetingDialog: React.FC<ScheduleMeetingDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  role,
  tutorStudents = [],
  tutorStudentsLoading = false,
}) => {
  const students = tutorStudents;
  const [notes, setNotes] = useState("");
  const [meetingType, setMeetingType] = useState<"in_person" | "virtual">("in_person");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt());
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [studentId, setStudentId] = useState("");

  useEffect(() => {
    if (open) {
      setNotes("");
      setMeetingType("in_person");
      setScheduledAt(defaultScheduledAt());
      setDurationMinutes(30);
      setLocation("");
      setMeetingLink("");
      setStudentId("");
    }
  }, [open]);

  const handleMeetingTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: "in_person" | "virtual" | null
  ) => {
    if (value) setMeetingType(value);
  };

  const handleSubmit = () => {
    const at = new Date(scheduledAt).toISOString();
    const payload: CreateMeetingInput = {
      meetingType: meetingType === "in_person" ? "in_person" : "virtual",
      scheduledAt: at,
      durationMinutes,
      notes: notes || undefined,
    };
    if (meetingType === "in_person" && location) payload.location = location;
    if (meetingType === "virtual" && meetingLink) payload.meetingLink = meetingLink;
    if (role === "tutor" && studentId) payload.studentId = studentId;

    if (role === "tutor" && !studentId) {
      return;
    }
    onSubmit(payload);
    onClose();
  };

  const canSubmit = role === "student" || (role === "tutor" && !!studentId);

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
        Schedule Meeting
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
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

          {role === "tutor" && (
            <FormControl fullWidth>
              <FormLabel>Participants *</FormLabel>
              <Select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                displayEmpty
                disabled={tutorStudentsLoading || isLoading}
                sx={{ mt: 0.5 }}
                renderValue={(v) => {
                  if (!v) return "Select a student";
                  return students.find((s) => s.id === v)?.name ?? v;
                }}
              >
                <MenuItem value="">
                  {tutorStudentsLoading ? "Loading students..." : "e.g. Oliver Smith, Emma Jones"}
                </MenuItem>
                {students.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.email})
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Separate multiple names with commas.</FormHelperText>
            </FormControl>
          )}

          {role === "student" && (
            <TextField
              label="Participants"
              value="Your assigned tutor"
              fullWidth
              disabled
              helperText="Meeting will be scheduled with your assigned tutor."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !canSubmit}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          {isLoading ? <CircularProgress size={24} /> : "Schedule Meeting"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

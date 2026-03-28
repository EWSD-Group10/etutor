"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { useTutors } from "@/app/hooks/tutors/useTutors";
import { useUnassignedStudents } from "@/app/hooks/allocations/useAllocations";
import { useStudents } from "@/app/hooks/students/useStudents";
import { Tutor } from "@/app/hooks/tutors/query";

interface BulkAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tutorId: string;
    studentIds: string[];
    reason?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export const BulkAllocationDialog: React.FC<BulkAllocationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const { data: tutorsData, isLoading: tutorsLoading } = useTutors(1, 1000);
  const { data: allStudentsData, isLoading: studentsLoading } = useStudents(1, 1000);
  const { data: unassignedData } = useUnassignedStudents();

  const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
  const [selectedStudents, setSelectedStudents] = React.useState<Set<string>>(new Set());
  const [studentFilter, setStudentFilter] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const tutors: Tutor[] = tutorsData?.data ?? [];
  const allStudents = allStudentsData?.data ?? [];
  const unassignedIds = React.useMemo(
    () => new Set((unassignedData?.data ?? []).map((s) => s.id)),
    [unassignedData],
  );

  const filteredStudents = allStudents.filter((s) => {
    const q = studentFilter.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.degreeProgram?.toLowerCase().includes(q)
    );
  });

  const handleStudentToggle = (studentId: string) => {
    const next = new Set(selectedStudents);
    if (next.has(studentId)) {
      next.delete(studentId);
    } else {
      next.add(studentId);
    }
    setSelectedStudents(next);
  };

  const handleSelectAllVisible = () => {
    const next = new Set(selectedStudents);
    filteredStudents.forEach((s) => next.add(s.id));
    setSelectedStudents(next);
  };

  const handleClearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleSubmit = () => {
    if (!selectedTutor || selectedStudents.size === 0) return;
    onSubmit({
      tutorId: selectedTutor.id,
      studentIds: Array.from(selectedStudents),
      reason: reason || undefined,
      notes: notes || undefined,
    });
    handleReset();
  };

  const handleReset = () => {
    setSelectedTutor(null);
    setSelectedStudents(new Set());
    setStudentFilter("");
    setReason("");
    setNotes("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 2, overflow: "hidden" } } }}
    >
      {/* Header */}
      <Box sx={{ px: 3, pt: 3, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Bulk Allocate Students
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Select a tutor and assign multiple students at once.
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose} sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", minHeight: 480 }}>
          {/* ── Column 1: Select Tutor ── */}
          <Box sx={{ borderRight: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleAltOutlinedIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Select Tutor
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
              {tutorsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                tutors.map((tutor) => {
                  const isSelected = selectedTutor?.id === tutor.id;
                  return (
                    <Box
                      key={tutor.id}
                      onClick={() => setSelectedTutor(tutor)}
                      sx={{
                        px: 1.5,
                        py: 1.5,
                        mb: 0.5,
                        borderRadius: 1.5,
                        cursor: "pointer",
                        border: "1px solid",
                        borderColor: isSelected ? "primary.main" : "transparent",
                        bgcolor: isSelected ? "primary.main" : "transparent",
                        color: isSelected ? "primary.contrastText" : "text.primary",
                        "&:hover": {
                          bgcolor: isSelected ? "primary.main" : "action.hover",
                        },
                        transition: "all 0.15s",
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {tutor.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ opacity: isSelected ? 0.85 : 1 }}
                        color={isSelected ? "inherit" : "text.secondary"}
                        noWrap
                      >
                        {tutor.department}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>

          {/* ── Column 2: Select Students ── */}
          <Box sx={{ borderRight: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccountCircleOutlinedIcon fontSize="small" color="action" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Select Students
                  </Typography>
                </Box>
                {selectedStudents.size > 0 && (
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      borderRadius: 10,
                      px: 1,
                      py: 0.25,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {selectedStudents.size} selected
                  </Box>
                )}
              </Box>
            </Box>

            {/* Filter input */}
            <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Filter students..."
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1.5, fontSize: 13 },
                  },
                }}
              />
            </Box>

            {/* Select All / Clear */}
            <Box sx={{ px: 2, py: 0.75, display: "flex", gap: 2 }}>
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: "pointer", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
                onClick={handleSelectAllVisible}
              >
                Select All Visible
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={handleClearSelection}
              >
                Clear
              </Typography>
            </Box>

            <Divider />

            {/* Student list */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1 }}>
              {studentsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : filteredStudents.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ px: 1, pt: 2, textAlign: "center" }}>
                  No students found
                </Typography>
              ) : (
                filteredStudents.map((student) => {
                  const isAssigned = !unassignedIds.has(student.id);
                  const isChecked = selectedStudents.has(student.id);
                  return (
                    <Box
                      key={student.id}
                      onClick={() => handleStudentToggle(student.id)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 1.5,
                        py: 1.25,
                        mb: 0.5,
                        borderRadius: 1.5,
                        cursor: "pointer",
                        bgcolor: isChecked ? "primary.50" : "transparent",
                        border: "1px solid",
                        borderColor: isChecked ? "primary.200" : "transparent",
                        "&:hover": { bgcolor: isChecked ? "primary.50" : "action.hover" },
                        transition: "all 0.15s",
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: 0.75,
                          border: "2px solid",
                          borderColor: isChecked ? "primary.main" : "grey.400",
                          bgcolor: isChecked ? "primary.main" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s",
                        }}
                      >
                        {isChecked && (
                          <CheckBoxOutlinedIcon sx={{ fontSize: 14, color: "white" }} />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {student.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {student.degreeProgram}
                        </Typography>
                      </Box>
                      {isAssigned && (
                        <Box
                          sx={{
                            flexShrink: 0,
                            fontSize: 10,
                            fontWeight: 600,
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 1,
                            bgcolor: isChecked ? "warning.100" : "warning.50",
                            color: "warning.dark",
                            border: "1px solid",
                            borderColor: "warning.200",
                            letterSpacing: 0.2,
                          }}
                        >
                          Reallocate
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>

          {/* ── Column 3: Allocation Details ── */}
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AssignmentOutlinedIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Allocation Details
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 2.5, py: 2, flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Reason (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Initial cohort assignment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                sx={{ mt: 0.75, mb: 2.5 }}
                slotProps={{ input: { sx: { borderRadius: 1.5, fontSize: 13 } } }}
              />

              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Notes (Optional)
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={3}
                placeholder="Additional context..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                sx={{ mt: 0.75 }}
                slotProps={{ input: { sx: { borderRadius: 1.5, fontSize: 13 } } }}
              />

              {/* Summary */}
              {(selectedTutor || selectedStudents.size > 0) && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "grey.50",
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "grey.200",
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="text.primary">
                    Summary
                  </Typography>
                  <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        Tutor:
                      </Typography>
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        {selectedTutor?.name ?? "—"}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        Students:
                      </Typography>
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        {selectedStudents.size > 0 ? `${selectedStudents.size} selected` : "—"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={handleClose} disabled={isLoading} variant="outlined" sx={{ borderRadius: 1.5, px: 2.5 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !selectedTutor || selectedStudents.size === 0}
          sx={{ borderRadius: 1.5, px: 2.5 }}
        >
          {isLoading ? <CircularProgress size={20} /> : "Allocate Students"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

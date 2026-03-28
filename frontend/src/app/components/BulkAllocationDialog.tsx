"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Box,
  TextField,
  Button,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  LinearProgress,
  InputAdornment,
  Chip,
  Divider,
} from "@mui/material";
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  AttachFile as FileTextIcon,
} from "@mui/icons-material";
import { useTutors } from "@/app/hooks/tutors/useTutors";
import { useUnassignedStudents } from "@/app/hooks/allocations/useAllocations";

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
  const { data: studentsData, isLoading: studentsLoading } =
    useUnassignedStudents();

  const [tutorId, setTutorId] = React.useState("");
  const [selectedStudents, setSelectedStudents] = React.useState<Set<string>>(
    new Set(),
  );
  const [studentFilter, setStudentFilter] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Default select first tutor when dialog opens
  React.useEffect(() => {
    if (open && tutorsData?.data && tutorsData.data.length > 0 && !tutorId) {
      setTutorId(tutorsData.data[0].id);
    }
  }, [open, tutorsData]);

  // Reset state when dialog closes
  React.useEffect(() => {
    if (!open) {
      setTutorId("");
      setSelectedStudents(new Set());
      setStudentFilter("");
      setReason("");
      setNotes("");
    }
  }, [open]);

  const selectedTutor = tutorsData?.data.find((t: any) => t.id === tutorId);

  const filteredStudents =
    studentsData?.data.filter(
      (s: any) =>
        s.name.toLowerCase().includes(studentFilter.toLowerCase()) ||
        s.email.toLowerCase().includes(studentFilter.toLowerCase()),
    ) || [];

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAllVisible = () => {
    const visibleIds = new Set(filteredStudents.map((s: any) => s.id));
    if (selectedStudents.size === visibleIds.size) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(visibleIds);
    }
  };

  const handleClearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleSubmit = () => {
    if (!tutorId || selectedStudents.size === 0) {
      alert("Please select a tutor and at least one student");
      return;
    }

    onSubmit({
      tutorId,
      studentIds: Array.from(selectedStudents),
      reason: reason || undefined,
      notes: notes || undefined,
    });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          Bulk Allocate Students
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          Select a tutor and assign multiple students at once.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 3,
            mt: 2,
          }}
        >
          {/* Select Tutor Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
              <SchoolIcon sx={{ color: "#1976d2" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Select Tutor
              </Typography>
            </Box>
            {tutorsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Stack spacing={1}>
                {tutorsData?.data.map((tutor: any) => (
                  <Paper
                    key={tutor.id}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      backgroundColor:
                        tutorId === tutor.id ? "#1976d2" : "transparent",
                      color: tutorId === tutor.id ? "white" : "inherit",
                      border:
                        tutorId === tutor.id ? "none" : "1px solid #e0e0e0",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor:
                          tutorId === tutor.id ? "#1565c0" : "#f5f5f5",
                      },
                    }}
                    onClick={() => setTutorId(tutor.id)}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {tutor.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          tutorId === tutor.id
                            ? "rgba(255,255,255,0.7)"
                            : "#666",
                        fontSize: "0.85rem",
                      }}
                    >
                      {tutor.department}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mt: 1,
                        gap: 1,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={
                          ((tutor.studentCount || 0) /
                            (tutor.maxStudents || 15)) *
                          100
                        }
                        sx={{
                          flex: 1,
                          backgroundColor:
                            tutorId === tutor.id
                              ? "rgba(255,255,255,0.3)"
                              : "#e0e0e0",
                          borderRadius: 1,
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          color:
                            tutorId === tutor.id
                              ? "rgba(255,255,255,0.8)"
                              : "#666",
                        }}
                      >
                        {tutor.studentCount || 0}/{tutor.maxStudents || 15}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>

          {/* Select Students Section */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PeopleIcon sx={{ color: "#1976d2" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Select Students
                </Typography>
              </Box>
              <Chip
                label={`${selectedStudents.size} selected`}
                size="small"
                color="primary"
                variant={selectedStudents.size > 0 ? "filled" : "outlined"}
              />
            </Box>
            <TextField
              placeholder="Filter unassigned students..."
              size="small"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#999", fontSize: "1.2rem" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, width: "100%" }}
              disabled={studentsLoading || isLoading}
            />
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAllVisible}
                disabled={
                  studentsLoading || isLoading || filteredStudents.length === 0
                }
              >
                Select All Visible
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearSelection}
                disabled={selectedStudents.size === 0}
              >
                Clear
              </Button>
            </Box>
            {studentsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <Paper
                variant="outlined"
                sx={{ maxHeight: 350, overflow: "auto" }}
              >
                <List sx={{ py: 0 }}>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student: any) => (
                      <ListItem
                        key={student.id}
                        disablePadding
                        secondaryAction={
                          selectedStudents.has(student.id) && (
                            <Box sx={{ color: "#1976d2", mr: 1 }}>
                              <FileTextIcon fontSize="small" />
                            </Box>
                          )
                        }
                      >
                        <ListItemButton
                          onClick={() => handleStudentToggle(student.id)}
                          dense
                          sx={{
                            backgroundColor: selectedStudents.has(student.id)
                              ? "#f0f7ff"
                              : "transparent",
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedStudents.has(student.id)}
                              tabIndex={-1}
                              disableRipple
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={student.name}
                            secondary={`${student.degreeProgram} • Year ${student.year || 1}`}
                            primaryTypographyProps={{
                              fontSize: "0.95rem",
                              fontWeight: 500,
                            }}
                            secondaryTypographyProps={{
                              fontSize: "0.8rem",
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))
                  ) : (
                    <ListItem>
                      <Typography variant="body2" sx={{ color: "#999" }}>
                        No students found
                      </Typography>
                    </ListItem>
                  )}
                </List>
              </Paper>
            )}
          </Box>

          {/* Allocation Details Section */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
              <FileTextIcon sx={{ color: "#1976d2" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Allocation Details
              </Typography>
            </Box>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                  Reason (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Initial cohort assignment"
                  disabled={isLoading}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                  Notes (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional context..."
                  disabled={isLoading}
                  size="small"
                />
              </Box>

              <Divider />

              {/* Summary */}
              <Box
                sx={{
                  backgroundColor: "#f0f7ff",
                  p: 2,
                  borderRadius: 1,
                  border: "1px solid #b3d9ff",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, mb: 1.5 }}
                >
                  Summary
                </Typography>
                <Stack spacing={1}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ color: "#1976d2" }}>
                      Tutor:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedTutor ? selectedTutor.name : "None selected"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ color: "#1976d2" }}>
                      Students:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, color: "#1976d2" }}
                    >
                      {selectedStudents.size} selected
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ display: "flex", gap: 1, pt: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={
                    isLoading || !tutorId || selectedStudents.size === 0
                  }
                >
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Allocate Students"
                  )}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

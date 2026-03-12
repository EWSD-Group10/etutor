"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Stack,
  CircularProgress,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
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
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const handleStudentToggle = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === studentsData?.data.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(studentsData?.data.map((s) => s.id) || []));
    }
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

    setTutorId("");
    setSelectedStudents(new Set());
    setReason("");
    setNotes("");
  };

  const handleClose = () => {
    setTutorId("");
    setSelectedStudents(new Set());
    setReason("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk Allocate Students</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <FormLabel>Tutor *</FormLabel>
            <Select
              value={tutorId}
              onChange={(e) => setTutorId(e.target.value)}
              disabled={tutorsLoading || isLoading}
            >
              <MenuItem value="">
                {tutorsLoading ? "Loading tutors..." : "Select a tutor"}
              </MenuItem>
              {tutorsData?.data.map((tutor: any) => (
                <MenuItem key={tutor.id} value={tutor.id}>
                  {tutor.name} ({tutor.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Students * ({selectedStudents.size} selected)</FormLabel>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: "auto" }}>
              <List>
                <ListItem disablePadding>
                  <ListItemButton
                    role={undefined}
                    onClick={handleSelectAll}
                    dense
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={
                          selectedStudents.size === studentsData?.data.length &&
                          studentsData?.data.length !== 0
                        }
                        indeterminate={
                          selectedStudents.size > 0 &&
                          selectedStudents.size < studentsData?.data.length
                        }
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText primary="Select All" />
                  </ListItemButton>
                </ListItem>

                {studentsLoading ? (
                  <ListItem>
                    <CircularProgress size={24} />
                  </ListItem>
                ) : (
                  studentsData?.data.map((student) => (
                    <ListItem
                      key={student.id}
                      disablePadding
                      onClick={() => handleStudentToggle(student.id)}
                    >
                      <ListItemButton role={undefined} dense>
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
                          secondary={student.email}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </FormControl>

          <TextField
            label="Reason"
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for bulk allocation"
            disabled={isLoading}
          />

          <TextField
            label="Notes"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes"
            disabled={isLoading}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading || !tutorId || selectedStudents.size === 0}
        >
          {isLoading ? <CircularProgress size={24} /> : "Allocate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

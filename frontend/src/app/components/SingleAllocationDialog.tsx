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
  Box,
} from "@mui/material";
import { useTutors } from "@/app/hooks/tutors/useTutors";
import { useUnassignedStudents } from "@/app/hooks/allocations/useAllocations";
import { Allocation } from "@/app/hooks/allocations/query";

interface SingleAllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tutorId: string;
    studentId: string;
    reason?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
  editingAllocation?: Allocation | null;
}

export const SingleAllocationDialog: React.FC<SingleAllocationDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading = false,
  editingAllocation,
}) => {
  const { data: tutorsData, isLoading: tutorsLoading } = useTutors(1, 1000);
  const { data: studentsData, isLoading: studentsLoading } =
    useUnassignedStudents();

  const [tutorId, setTutorId] = React.useState("");
  const [studentId, setStudentId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (editingAllocation) {
      setTutorId(editingAllocation.tutorId);
      setStudentId(editingAllocation.studentId);
      setReason(editingAllocation.reason || "");
      setNotes(editingAllocation.notes || "");
    } else {
      setTutorId("");
      setStudentId("");
      setReason("");
      setNotes("");
    }
  }, [editingAllocation, open]);

  const handleSubmit = () => {
    if (!tutorId || !studentId) {
      alert("Please select both tutor and student");
      return;
    }

    onSubmit({
      tutorId,
      studentId,
      reason: reason || undefined,
      notes: notes || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingAllocation ? "Reallocate Student" : "Allocate Student to Tutor"}
      </DialogTitle>
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
            <FormLabel>Student *</FormLabel>
            <Select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={studentsLoading || isLoading}
            >
              <MenuItem value="">
                {studentsLoading ? "Loading students..." : "Select a student"}
              </MenuItem>
              {studentsData?.data.map((student) => (
                <MenuItem key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Reason"
            multiline
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for allocation"
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
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isLoading || !tutorId || !studentId}
        >
          {isLoading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

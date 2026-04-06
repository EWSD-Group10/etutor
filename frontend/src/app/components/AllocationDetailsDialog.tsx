"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Stack,
  Typography,
  Button,
  Avatar,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemButton,
  LinearProgress,
  CircularProgress,
} from "@mui/material";
import { Allocation } from "@/app/hooks/allocations/query";
import { useTutors } from "@/app/hooks/tutors/useTutors";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

interface AllocationDetailsDialogProps {
  open: boolean;
  allocation: Allocation | null;
  onClose: () => void;
  onRemove?: (allocationId: string) => void;
  onReallocate?: (allocationId: string, newTutorId: string) => void;
  isLoading?: boolean;
}

export const AllocationDetailsDialog: React.FC<
  AllocationDetailsDialogProps
> = ({
  open,
  allocation,
  onClose,
  onRemove,
  onReallocate,
  isLoading = false,
}) => {
  const [showReallocateView, setShowReallocateView] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<
    "remove" | "reallocate" | null
  >(null);
  const { data: tutorsData, isLoading: tutorsLoading } = useTutors(1, 1000);

  // Reset to details view whenever dialog opens
  useEffect(() => {
    if (open) {
      setShowReallocateView(false);
      setSelectedTutorId("");
    }
  }, [open]);

  const handleReallocateClick = () => {
    setShowReallocateView(true);
    setSelectedTutorId("");
  };

  const handleConfirmReallocate = () => {
    if (
      allocation &&
      selectedTutorId &&
      selectedTutorId !== allocation.tutorId
    ) {
      setConfirmationTitle("Confirm reallocation");
      setConfirmationMessage(
        `Are you sure you want to move ${allocation.studentName} from ${allocation.tutorName} to the selected tutor?`,
      );
      setConfirmationAction("reallocate");
      setConfirmationOpen(true);
    }
  };

  const handleRemove = () => {
    if (!allocation) return;

    setConfirmationTitle("Remove allocation");
    setConfirmationMessage("Are you sure you want to remove this allocation?");
    setConfirmationAction("remove");
    setConfirmationOpen(true);
  };

  const handleConfirmAction = () => {
    if (!allocation || !confirmationAction) {
      setConfirmationOpen(false);
      setConfirmationAction(null);
      return;
    }

    if (confirmationAction === "remove") {
      onRemove?.(allocation.id);
      onClose();
    }

    if (confirmationAction === "reallocate") {
      onReallocate?.(allocation.id, selectedTutorId);
      onClose();
    }

    setConfirmationOpen(false);
    setConfirmationAction(null);
  };

  const handleClose = () => {
    setShowReallocateView(false);
    setSelectedTutorId("");
    setConfirmationOpen(false);
    setConfirmationAction(null);
    onClose();
  };

  const otherTutors =
    tutorsData?.data.filter((t: any) => t.id !== allocation?.tutorId) || [];

  if (!allocation) return null;

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {showReallocateView ? (
          <>
            <DialogTitle>Reallocate Student</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={3}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    This will remove the student from{" "}
                    <strong>{allocation.tutorName}</strong> and assign them to a
                    new tutor.
                  </Typography>
                </Alert>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Select New Tutor
                  </Typography>
                  {tutorsLoading ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 2 }}
                    >
                      <CircularProgress size={24} />
                    </Box>
                  ) : (
                    <Paper variant="outlined">
                      <List sx={{ maxHeight: 350, overflow: "auto" }}>
                        {otherTutors.length > 0 ? (
                          otherTutors.map((tutor: any) => (
                            <ListItem key={tutor.id} disablePadding>
                              <ListItemButton
                                selected={selectedTutorId === tutor.id}
                                onClick={() => setSelectedTutorId(tutor.id)}
                              >
                                <Box sx={{ width: "100%" }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {tutor.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{ color: "#666" }}
                                    >
                                      {tutor.studentCount || 0}/
                                      {tutor.maxStudents || 15}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#999",
                                      display: "block",
                                      mb: 0.5,
                                    }}
                                  >
                                    {tutor.department}
                                  </Typography>
                                  <LinearProgress
                                    variant="determinate"
                                    value={
                                      ((tutor.studentCount || 0) /
                                        (tutor.maxStudents || 15)) *
                                      100
                                    }
                                    sx={{ height: 4, borderRadius: 2 }}
                                  />
                                </Box>
                              </ListItemButton>
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <Typography variant="body2" sx={{ color: "#999" }}>
                              No other tutors available
                            </Typography>
                          </ListItem>
                        )}
                      </List>
                    </Paper>
                  )}
                </Box>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => setShowReallocateView(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleConfirmReallocate}
                    disabled={!selectedTutorId || isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Confirm Reallocation"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>Allocation Details</DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={3}>
                {/* Student Section */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Student
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Avatar sx={{ backgroundColor: "#1976d2" }}>
                      {allocation.studentName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {allocation.studentName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {allocation.studentEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Tutor Section */}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Tutor
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Avatar sx={{ backgroundColor: "#388e3c" }}>
                      {allocation.tutorName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {allocation.tutorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666" }}>
                        {allocation.tutorEmail}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Allocation Info */}
                <Box
                  sx={{
                    backgroundColor: "#f5f5f5",
                    p: 2,
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 2 }}
                  >
                    Allocation Info
                  </Typography>
                  <Stack spacing={1}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" sx={{ color: "#666" }}>
                        Date:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {allocation.allocatedAt
                          ? new Date(
                              allocation.allocatedAt,
                            ).toLocaleDateString()
                          : "—"}
                      </Typography>
                    </Box>
                    {allocation.reason && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Reason:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {allocation.reason}
                        </Typography>
                      </Box>
                    )}
                    {allocation.notes && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography variant="body2" sx={{ color: "#666" }}>
                          Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {allocation.notes}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    disabled={isLoading}
                  >
                    Close
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleReallocateClick}
                    disabled={isLoading}
                  >
                    Reallocate
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleRemove}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      "Remove Allocation"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>

      <ConfirmationDialog
        open={confirmationOpen}
        title={confirmationTitle}
        message={confirmationMessage}
        confirmLabel={confirmationAction === "remove" ? "Remove" : "Confirm"}
        confirmColor={confirmationAction === "remove" ? "error" : "primary"}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        showCancel={Boolean(confirmationAction)}
      />
    </>
  );
};

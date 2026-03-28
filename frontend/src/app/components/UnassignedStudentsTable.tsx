"use client";

import React, { useState } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Alert,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { Allocation } from "@/app/hooks/allocations/query";
import { useTutors } from "@/app/hooks/tutors/useTutors";

interface UnassignedStudentsTableProps {
  data: Allocation[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onAssign?: (studentId: string, tutorId: string) => void;
  isLoading?: boolean;
}

export const UnassignedStudentsTable: React.FC<
  UnassignedStudentsTableProps
> = ({
  data,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onAssign,
  isLoading = false,
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedStudentName, setSelectedStudentName] = useState<string>("");
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const { data: tutorsData, isLoading: tutorsLoading } = useTutors(1, 1000);

  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onLimitChange(parseInt(event.target.value, 10));
  };

  const handleOpenAssignDialog = (studentId: string, studentName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    setSelectedTutorId("");
    setAssignDialogOpen(true);
  };

  const handleConfirmAssign = () => {
    if (selectedStudentId && selectedTutorId) {
      onAssign?.(selectedStudentId, selectedTutorId);
      setAssignDialogOpen(false);
    }
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 600, width: "120px" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((student) => (
                <TableRow
                  key={student.id}
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {student.studentName}
                  </TableCell>
                  <TableCell sx={{ color: "#666" }}>
                    {student.studentEmail}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() =>
                        handleOpenAssignDialog(student.id, student.studentName)
                      }
                      disabled={isLoading}
                      sx={{
                        backgroundColor: "#1976d2",
                        color: "white",
                        textTransform: "none",
                        fontSize: "0.875rem",
                      }}
                    >
                      Assign
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4, color: "#999" }}
                >
                  No unassigned students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Assign Dialog */}
      <Dialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assign Student to Tutor</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" sx={{ color: "#666", mb: 1 }}>
                Assigning student:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {selectedStudentName}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Select Tutor
              </Typography>
              {tutorsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : tutorsData?.data && tutorsData.data.length > 0 ? (
                <Paper variant="outlined">
                  <List sx={{ maxHeight: 350, overflow: "auto" }}>
                    {tutorsData.data.map((tutor: any) => (
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
                    ))}
                  </List>
                </Paper>
              ) : (
                <Alert severity="info">No tutors available</Alert>
              )}
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => setAssignDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirmAssign}
                disabled={!selectedTutorId || isLoading}
              >
                {isLoading ? <CircularProgress size={20} /> : "Assign"}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

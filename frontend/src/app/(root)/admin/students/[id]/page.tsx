"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack, Edit, Delete } from "@mui/icons-material";
import { useStudent } from "@/app/hooks/students/useStudent";
import { useDeleteStudent } from "@/app/hooks/students/useStudentsMutations";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading, error } = useStudent(studentId);
  const deleteStudentMutation = useDeleteStudent();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDelete = async () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteStudentMutation.mutateAsync(studentId);
      router.push("/students");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setConfirmDeleteOpen(false);
    }
  };

  const handleEdit = () => {
    router.push(`/students/${studentId}/edit`);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">Error loading student details</Alert>
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Student not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => router.back()}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {student.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ID: {student.id}
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{student.email}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Degree Program
                </Typography>
                <Typography variant="body1">
                  {student.degreeProgram || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {student.isActive ? "✓ Active" : "✗ Inactive"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(student.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete student"
        message="Are you sure you want to delete this student?"
        confirmLabel="Delete"
        confirmColor="error"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

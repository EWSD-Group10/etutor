"use client";

import React from "react";
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
import { useTutor } from "@/app/hooks/tutors/useTutor";
import { useDeleteTutor } from "@/app/hooks/tutors/useTutorsMutations";

export default function TutorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tutorId = params.id as string;

  const { data: tutor, isLoading, error } = useTutor(tutorId);
  const deleteTutorMutation = useDeleteTutor();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this tutor?")) {
      try {
        await deleteTutorMutation.mutateAsync(tutorId);
        router.push("/tutors");
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/tutors/${tutorId}/edit`);
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
        <Alert severity="error">Error loading tutor details</Alert>
      </Box>
    );
  }

  if (!tutor) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Tutor not found</Alert>
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
                {tutor.name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ID: {tutor.id}
              </Typography>
            </Box>

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">{tutor.email}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Department
                </Typography>
                <Typography variant="body1">
                  {tutor.department || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Degree Program
                </Typography>
                <Typography variant="body1">
                  {tutor.degreeProgram || "N/A"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {tutor.isActive ? "✓ Active" : "✗ Inactive"}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {new Date(tutor.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

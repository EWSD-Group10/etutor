"use client";

import React, { useState } from "react";
import { Box, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { TutorTable } from "@/app/components/TutorTable";
import AddTutorDialog, {
  TutorFormValues,
} from "@/app/components/AddTutorDialog";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import { useTutors } from "@/app/hooks/tutors/useTutors";
import {
  useCreateTutor,
  useUpdateTutor,
  useDeleteTutor,
} from "@/app/hooks/tutors/useTutorsMutations";

export default function TutorsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading, error } = useTutors(page, limit);

  // dialog/edit state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<
    (TutorFormValues & { id?: string }) | null
  >(null);

  const createMutation = useCreateTutor();
  const updateMutation = useUpdateTutor();
  const deleteMutation = useDeleteTutor();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTutorId, setDeleteTutorId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openView = (tutorId: string) => {
    router.push(`/admin/view-as/tutor/${tutorId}`);
  };

  const openDelete = (tutorId: string) => {
    setDeleteTutorId(tutorId);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTutorId) {
      deleteMutation.mutate(deleteTutorId);
    }
    setConfirmDeleteOpen(false);
    setDeleteTutorId(null);
  };

  const openEdit = (tutor: any) => {
    setEditing({
      id: tutor.id,
      fullName: tutor.name,
      email: tutor.email,
      degreeProgram: tutor.degreeProgram || "",
      department: tutor.department || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = (values: TutorFormValues) => {
    if (editing && editing.id) {
      updateMutation.mutate({ id: editing.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", mx: "auto" }}>
      <Stack spacing={3}>
        <TutorTable
          data={data?.data || []}
          page={page}
          limit={limit}
          total={data?.pagination?.total || 0}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onEdit={openEdit}
          onAdd={openAdd}
          onView={openView}
          onDelete={openDelete}
          viewTooltip="View dashboard as this tutor"
        />
      </Stack>

      <AddTutorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing || undefined}
        isEdit={Boolean(editing && editing.id)}
      />

      <ConfirmationDialog
        open={confirmDeleteOpen}
        title="Delete tutor"
        message="Are you sure you want to delete this tutor?"
        confirmLabel="Delete"
        confirmColor="error"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}

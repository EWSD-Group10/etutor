"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack } from "@mui/material";
import { StudentTable } from "@/app/components/StudentTable";
import AddStudentDialog, {
  StudentFormValues,
} from "@/app/components/AddStudentDialog";
import { useStudents } from "@/app/hooks/students/useStudents";
import {
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/app/hooks/students/useStudentsMutations";

export default function StudentPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data, isLoading, error } = useStudents(page, limit);

  // dialog / editing state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<
    (StudentFormValues & { id?: string }) | null
  >(null);

  const createMutation = useCreateStudent();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (student: any) => {
    setEditing({
      id: student.id,
      fullName: student.name,
      email: student.email,
      degreeProgram: student.degreeProgram || "",
    });
    setDialogOpen(true);
  };

  const openView = (studentId: string) => {
    router.push(`/admin/students/${studentId}`);
  };

  const openDelete = (studentId: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteMutation.mutate(studentId);
    }
  };

  const handleSubmit = (values: StudentFormValues) => {
    if (editing && editing.id) {
      updateMutation.mutate({ id: editing.id, ...values });
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", mx: "auto" }}>
      <Stack spacing={3}>
        <StudentTable
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
          onView={openView}
          onDelete={openDelete}
          onAdd={openAdd}
        />
      </Stack>

      <AddStudentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        initialValues={editing || undefined}
        isEdit={Boolean(editing && editing.id)}
      />
    </Box>
  );
}

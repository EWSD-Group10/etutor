"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack, CircularProgress } from "@mui/material";
import { StudentTable } from "@/app/components/StudentTable";
import { useTutorMyStudents } from "@/app/hooks/tutors/useTutors";
import type { TutorStudent } from "@/app/hooks/tutors/query";
import type { Student } from "@/app/hooks/students/query";

function toStudentRow(s: TutorStudent): Student {
  return {
    id: s.id,
    name: s.name ?? "",
    email: s.email,
    role: s.role || "student",
    degreeProgram: s.degreeProgram ?? "",
    isActive: s.isActive,
    createdAt: s.createdAt,
  };
}

export default function TutorStudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const { data: rawList, isLoading } = useTutorMyStudents();

  const allStudents = useMemo(() => (rawList ?? []).map(toStudentRow), [rawList]);

  const total = allStudents.length;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return allStudents.slice(start, start + limit);
  }, [allStudents, page, limit]);

  if (isLoading && !rawList) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", mx: "auto" }}>
      <Stack spacing={3}>
        <StudentTable
          data={paginatedData}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          title="My Students"
          subtitle="Students currently assigned to you"
          showCreatedAt={false}
          onStudentDocuments={(id) => router.push(`/tutor/students/${id}/documents`)}
        />
      </Stack>
    </Box>
  );
}

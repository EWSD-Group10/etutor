"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DocumentsToolbar, { type DocumentsFilterValue } from "@/app/components/documents/DocumentsToolbar";
import DocumentsDataTable, { type DocumentTableRow } from "@/app/components/documents/DocumentsDataTable";
import { getFormatCategory } from "@/app/components/documents/documentFormatUtils";
import { useDocuments } from "@/app/hooks/documents/useDocuments";
import { downloadDocumentFile, type DocumentRecord } from "@/app/hooks/documents/query";
import { useTutorMyStudents } from "@/app/hooks/tutors/useTutors";

function mapToRows(data: { data: DocumentRecord[] } | undefined): DocumentTableRow[] {
  if (!data?.data) return [];
  return data.data.map((d) => ({
    id: d.id,
    fileName: d.fileName || "Untitled",
    fileFormat: d.fileFormat,
    sizeBytes: d.fileSize ?? 0,
    uploadedBy: d.uploader?.name || "Unknown",
    uploadedAt: d.uploadedAt,
    uploaderId: d.uploader?.id ?? "",
  }));
}

export default function TutorStudentDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = typeof params.studentId === "string" ? params.studentId : "";

  const [filter, setFilter] = useState<DocumentsFilterValue>("all");
  const [search, setSearch] = useState("");

  const { data: students, isLoading: studentsLoading } = useTutorMyStudents();

  const assigned = useMemo(
    () => Boolean(studentId && students?.some((s) => s.id === studentId)),
    [students, studentId],
  );

  const studentName = useMemo(
    () => students?.find((s) => s.id === studentId)?.name || "Student",
    [students, studentId],
  );

  const { data, isLoading: docsLoading, isError } = useDocuments(
    studentId || undefined,
    { enabled: Boolean(studentId) && assigned },
  );

  const rows = useMemo(() => mapToRows(data), [data]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const cat = getFormatCategory(row.fileName, row.fileFormat);
      if (filter !== "all" && cat !== filter) return false;
      if (!q) return true;
      return row.fileName.toLowerCase().includes(q) || row.uploadedBy.toLowerCase().includes(q);
    });
  }, [rows, filter, search]);

  const handleView = async (row: DocumentTableRow) => {
    try {
      await downloadDocumentFile(row.id, row.fileName);
    } catch (e) {
      console.error(e);
      window.alert("Could not download file.");
    }
  };

  if (!studentId) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography color="error">Invalid student.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/tutor/students")} sx={{ mt: 2 }}>
          Back to students
        </Button>
      </Box>
    );
  }

  if (studentsLoading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!assigned) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography color="text.secondary">This student is not assigned to you.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/tutor/students")} sx={{ mt: 2 }}>
          Back to students
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/tutor/students")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 600 }}
      >
        Back to students
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
          Documents
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Files uploaded by {studentName}
        </Typography>
      </Box>

      {isError && (
        <Typography color="error" sx={{ mb: 2 }}>
          Could not load documents.
        </Typography>
      )}

      {docsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={0}>
          <DocumentsToolbar
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
          />
          <DocumentsDataTable rows={filteredRows} showEdit={false} onView={handleView} />
        </Stack>
      )}
    </Box>
  );
}

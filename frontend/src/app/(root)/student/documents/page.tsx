"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DashboardStatsCard from "@/app/components/dashboard/DashboardStatsCard";
import DocumentsToolbar, {
  type DocumentsFilterValue,
} from "@/app/components/documents/DocumentsToolbar";
import DocumentsDataTable, {
  type DocumentTableRow,
} from "@/app/components/documents/DocumentsDataTable";
import UploadDocumentDialog from "@/app/components/documents/UploadDocumentDialog";
import DocumentCommentsDialog from "@/app/components/documents/DocumentCommentsDialog";
import {
  getFormatCategory,
  STUDENT_DOCUMENT_ACCEPT,
  STUDENT_UPLOAD_HINT,
  isAllowedStudentUploadFile,
} from "@/app/components/documents/documentFormatUtils";
import { useDocuments } from "@/app/hooks/documents/useDocuments";
import {
  useUploadDocument,
  useDeleteDocument,
} from "@/app/hooks/documents/useDocumentMutations";
import {
  downloadDocumentFile,
  type DocumentRecord,
} from "@/app/hooks/documents/query";

function mapToRows(
  data: { data: DocumentRecord[] } | undefined,
): DocumentTableRow[] {
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

export default function StudentDocumentsPage() {
  const [filter, setFilter] = useState<DocumentsFilterValue>("all");
  const [search, setSearch] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<null | {
    id: string;
    fileName: string;
  }>(null);

  const { data, isLoading } = useDocuments();
  const uploadMutation = useUploadDocument();
  const deleteMutation = useDeleteDocument();

  const rows = useMemo(() => mapToRows(data), [data]);

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const totalBytes = rows.reduce((s, r) => s + r.sizeBytes, 0);
    const recent = rows.filter(
      (r) => new Date(r.uploadedAt) >= sevenDaysAgo,
    ).length;
    return { total, totalBytes, recent };
  }, [rows, sevenDaysAgo]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const cat = getFormatCategory(row.fileName, row.fileFormat);
      if (filter !== "all" && cat !== filter) return false;
      if (!q) return true;
      return (
        row.fileName.toLowerCase().includes(q) ||
        row.uploadedBy.toLowerCase().includes(q)
      );
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

  const handleDelete = (row: DocumentTableRow) => {
    if (!window.confirm(`Delete "${row.fileName}"?`)) return;
    deleteMutation.mutate(row.id);
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1 && bytes > 0) return "< 0.1 MB";
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}
          >
            Documents
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontWeight: 500 }}
          >
            Upload and manage your files (PDF, Word, Excel, PowerPoint)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={() => setUploadOpen(true)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
            py: 1,
            boxShadow: "0px 4px 12px rgba(25, 118, 210, 0.2)",
          }}
        >
          Upload Document
        </Button>
      </Box>

      <UploadDocumentDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={(file) => uploadMutation.mutateAsync(file)}
        isUploading={uploadMutation.isPending}
        accept={STUDENT_DOCUMENT_ACCEPT}
        hint={STUDENT_UPLOAD_HINT}
        validateBeforeUpload={(file) =>
          isAllowedStudentUploadFile(file)
            ? null
            : "Only PDF, Word (.doc, .docx), Excel (.xls, .xlsx), and PowerPoint (.ppt, .pptx) are allowed."
        }
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatsCard
            label="Total Documents"
            value={String(stats.total)}
            icon={<DescriptionIcon />}
            color="#1976d2"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatsCard
            label="Total Storage Used"
            value={formatStorage(stats.totalBytes)}
            icon={<StorageIcon />}
            color="#7b1fa2"
            isLoading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <DashboardStatsCard
            label="Recent Uploads (7d)"
            value={String(stats.recent)}
            icon={<ScheduleIcon />}
            color="#ed6c02"
            isLoading={isLoading}
          />
        </Grid>
      </Grid>

      {isLoading ? (
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
          <DocumentsDataTable
            rows={filteredRows}
            canDeleteRow={() => true}
            showEdit={false}
            onView={handleView}
            onDelete={handleDelete}
            onComment={(row) => {
              setSelectedDocument({ id: row.id, fileName: row.fileName });
              setCommentDialogOpen(true);
            }}
          />
        </Stack>
      )}

      <DocumentCommentsDialog
        open={commentDialogOpen}
        documentId={selectedDocument?.id ?? null}
        documentName={selectedDocument?.fileName ?? "Document"}
        onClose={() => {
          setCommentDialogOpen(false);
          setSelectedDocument(null);
        }}
      />
    </Box>
  );
}

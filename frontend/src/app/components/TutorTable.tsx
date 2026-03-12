"use client";

import React from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DataTable, Column } from "./Table";
import PageHeader from "./TableHeader"; // header with title/add button for tables
import { Tutor } from "@/app/hooks/tutors/query";

interface TutorTableProps {
  data: Tutor[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit?: (tutor: Tutor) => void;
  onView?: (tutorId: string) => void;
  onDelete?: (tutorId: string) => void;
  onAdd?: () => void;
}

const tutorColumns: Column<Tutor>[] = [
  {
    id: "name",
    label: "Name",
    minWidth: 150,
  },
  {
    id: "email",
    label: "Email",
    minWidth: 200,
  },
  {
    id: "department",
    label: "Department",
    minWidth: 180,
  },
  {
    id: "isActive",
    label: "Status",
    minWidth: 100,
    format: (value: boolean) => (value ? "✓ Active" : "✗ Inactive"),
  },
  {
    id: "createdAt",
    label: "Created At",
    minWidth: 150,
    format: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const tutorActionsColumn: Column<Tutor> = {
  id: "id" as keyof Tutor,
  label: "Actions",
  minWidth: 150,
  align: "center",
  render: (_, tutor: Tutor) => {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => (window as any).__onViewTutor?.(tutor.id)}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            color="warning"
            onClick={() => (window as any).__onEditTutor?.(tutor)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => (window as any).__onDeleteTutor?.(tutor.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  },
};

export const TutorTable: React.FC<TutorTableProps> = ({
  data,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onView,
  onDelete,
  onAdd,
}) => {
  // Store callbacks in window for access in static actions column
  React.useEffect(() => {
    (window as any).__onEditTutor = onEdit;
    (window as any).__onViewTutor = onView;
    (window as any).__onDeleteTutor = onDelete;
  }, [onEdit, onView, onDelete]);

  return (
    <>
      <PageHeader
        title="Tutors Directory"
        subtitle="Manage tutor records and details"
        buttonText="Add Tutor"
        onButtonClick={onAdd}
      />
      <DataTable<Tutor>
        columns={[...tutorColumns, tutorActionsColumn]}
        data={data}
        page={page}
        limit={limit}
        total={total}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </>
  );
};

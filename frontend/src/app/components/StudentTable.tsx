"use client";

import React from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DataTable, Column } from "./Table";
import PageHeader from "./TableHeader"; // header with title/add button for tables
import { Student } from "@/app/hooks/students/query";

interface StudentTableProps {
  data: Student[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onEdit?: (student: Student) => void;
  onView?: (studentId: string) => void;
  onDelete?: (studentId: string) => void;
  onAdd?: () => void;
}

const studentColumns: Column<Student>[] = [
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
    id: "degreeProgram",
    label: "Degree Program",
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

const studentActionsColumn: Column<Student> = {
  id: "id" as keyof Student,
  label: "Actions",
  minWidth: 150,
  align: "center",
  render: (_, student: Student) => {
    return (
      <Stack direction="row" spacing={1} justifyContent="center">
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => (window as any).__onViewStudent?.(student.id)}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton
            size="small"
            color="warning"
            onClick={() => (window as any).__onEditStudent?.(student)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => (window as any).__onDeleteStudent?.(student.id)}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  },
};

export const StudentTable: React.FC<StudentTableProps> = ({
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
    (window as any).__onEditStudent = onEdit;
    (window as any).__onViewStudent = onView;
    (window as any).__onDeleteStudent = onDelete;
  }, [onEdit, onView, onDelete]);

  return (
    <>
      <PageHeader
        title="Students Directory"
        subtitle="Manage student records and performance"
        buttonText="Add Student"
        onButtonClick={onAdd}
      />
      <DataTable<Student>
        columns={[...studentColumns, studentActionsColumn]}
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

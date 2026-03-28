"use client";

import React, { useMemo, type ReactNode } from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { Visibility, Edit, Delete, Description } from "@mui/icons-material";
import { DataTable, Column } from "./Table";
import PageHeader from "./TableHeader";
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
  /** Tutor: open assigned student's uploaded documents */
  onStudentDocuments?: (studentId: string) => void;
  onAdd?: () => void;
  /** Override default admin directory copy */
  title?: string;
  subtitle?: string;
  /** Default true (admin). Tutors often omit created-at. */
  showCreatedAt?: boolean;
  /** Tooltip on the eye action (e.g. admin “view as dashboard”). */
  viewTooltip?: string;
  headerActions?: ReactNode;
}

const studentBaseColumns: Column<Student>[] = [
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
];

const createdAtColumn: Column<Student> = {
  id: "createdAt",
  label: "Created At",
  minWidth: 150,
  format: (value: string) => new Date(value).toLocaleDateString(),
};

function makeActionsColumn(
  onView?: (id: string) => void,
  onEdit?: (s: Student) => void,
  onDelete?: (id: string) => void,
  onStudentDocuments?: (id: string) => void,
  viewTooltip = "View Details",
): Column<Student> | null {
  if (!onView && !onEdit && !onDelete && !onStudentDocuments) return null;

  return {
    id: "id" as keyof Student,
    label: "Actions",
    minWidth: onStudentDocuments ? 200 : 150,
    align: "center",
    render: (_, student: Student) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        {onStudentDocuments && (
          <Tooltip title="Student documents">
            <IconButton
              size="small"
              color="info"
              onClick={() => onStudentDocuments(student.id)}
            >
              <Description fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onView && (
          <Tooltip title={viewTooltip}>
            <IconButton size="small" color="primary" onClick={() => onView(student.id)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton size="small" color="warning" onClick={() => onEdit(student)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(student.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  };
}

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
  onStudentDocuments,
  onAdd,
  title = "Students Directory",
  subtitle = "Manage student records and performance",
  showCreatedAt = true,
  viewTooltip = "View Details",
  headerActions,
}) => {
  const columns = useMemo(() => {
    const dataCols = showCreatedAt ? [...studentBaseColumns, createdAtColumn] : studentBaseColumns;
    const actions = makeActionsColumn(
      onView,
      onEdit,
      onDelete,
      onStudentDocuments,
      viewTooltip,
    );
    return actions ? [...dataCols, actions] : dataCols;
  }, [showCreatedAt, onView, onEdit, onDelete, onStudentDocuments, viewTooltip]);

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        buttonText={onAdd ? "Add Student" : undefined}
        onButtonClick={onAdd}
        actions={headerActions}
      />
      <DataTable<Student>
        columns={columns}
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

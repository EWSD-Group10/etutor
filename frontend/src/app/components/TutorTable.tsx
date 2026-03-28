"use client";

import React, { useMemo } from "react";
import { IconButton, Tooltip, Stack } from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import { DataTable, Column } from "./Table";
import PageHeader from "./TableHeader";
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
  /** Tooltip on the eye action (e.g. admin “view as dashboard”). */
  viewTooltip?: string;
}

const tutorBaseColumns: Column<Tutor>[] = [
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

function makeTutorActionsColumn(
  onView?: (id: string) => void,
  onEdit?: (t: Tutor) => void,
  onDelete?: (id: string) => void,
  viewTooltip = "View Details",
): Column<Tutor> | null {
  if (!onView && !onEdit && !onDelete) return null;

  return {
    id: "id" as keyof Tutor,
    label: "Actions",
    minWidth: 150,
    align: "center",
    render: (_, tutor: Tutor) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        {onView && (
          <Tooltip title={viewTooltip}>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onView(tutor.id)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onEdit && (
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="warning"
              onClick={() => onEdit(tutor)}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(tutor.id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  };
}

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
  viewTooltip = "View Details",
}) => {
  const columns = useMemo(() => {
    const actions = makeTutorActionsColumn(onView, onEdit, onDelete, viewTooltip);
    return actions ? [...tutorBaseColumns, actions] : tutorBaseColumns;
  }, [onView, onEdit, onDelete, viewTooltip]);

  return (
    <>
      <PageHeader
        title="Tutors Directory"
        subtitle="Manage tutor records and details"
        buttonText="Add Tutor"
        onButtonClick={onAdd}
      />
      <DataTable<Tutor>
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

"use client";

import React, { useState } from "react";
import { Box, TextField, Button, Stack } from "@mui/material";
import { DataTable, Column } from "@/app/components/Table";
import { useStudents } from "../hooks/students/useStudents";
interface Student {
  id: string;
  email: string;
  name: string;
  role: string;
  degreeProgram: string;
  isActive: boolean;
  createdAt: string;
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

export default function StudentPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useStudents();

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Search Bar */}
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
          <Button variant="outlined" onClick={handleClearSearch}>
            Clear
          </Button>
        </Stack>

        {/* Table */}
        <DataTable<Student>
          columns={studentColumns}
          data={data?.data || []}
          isLoading={isLoading}
          error={error}
          page={page}
          limit={limit}
          total={data?.pagination.total || 0}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </Stack>
    </Box>
  );
}

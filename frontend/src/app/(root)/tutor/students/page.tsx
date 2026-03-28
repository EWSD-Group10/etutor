"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { StudentTable } from "@/app/components/StudentTable";
import { useTutorMyStudents } from "@/app/hooks/tutors/useTutors";
import type { TutorStudent } from "@/app/hooks/tutors/query";
import type { Student } from "@/app/hooks/students/query";

type TuteeSort =
  | "name_asc"
  | "name_desc"
  | "allocated_desc"
  | "allocated_asc"
  | "unread_desc";

const outlinedSoftSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    bgcolor: alpha("#000", 0.025),
    transition: "background-color 0.15s ease, box-shadow 0.15s ease",
    "&:hover": {
      bgcolor: alpha("#000", 0.04),
    },
    "&.Mui-focused": {
      bgcolor: "#fff",
      boxShadow: `0 0 0 3px ${alpha("#1976d2", 0.12)}`,
    },
    "& fieldset": {
      borderColor: alpha("#000", 0.08),
    },
    "&:hover fieldset": {
      borderColor: alpha("#1976d2", 0.25),
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
      borderWidth: "1px",
    },
  },
};

function toStudentRow(s: TutorStudent): Student {
  return {
    id: s.id,
    name: s.name ?? "",
    email: s.email,
    role: s.role || "student",
    degreeProgram: s.degreeProgram ?? "",
    isActive: s.isActive,
    createdAt: s.createdAt,
    allocatedAt: s.allocatedAt,
    unreadFromStudent: s.unreadFromStudent,
  };
}

function matchesSearch(s: TutorStudent, q: string) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return [s.name, s.email, s.degreeProgram].some((field) =>
    (field ?? "").toLowerCase().includes(needle),
  );
}

function sortTutees(list: TutorStudent[], sort: TuteeSort): TutorStudent[] {
  const copy = [...list];
  const name = (a: TutorStudent, b: TutorStudent) =>
    (a.name ?? "").localeCompare(b.name ?? "", undefined, {
      sensitivity: "base",
    });
  switch (sort) {
    case "name_asc":
      return copy.sort(name);
    case "name_desc":
      return copy.sort((a, b) => name(b, a));
    case "allocated_desc":
      return copy.sort(
        (a, b) =>
          new Date(b.allocatedAt).getTime() -
          new Date(a.allocatedAt).getTime(),
      );
    case "allocated_asc":
      return copy.sort(
        (a, b) =>
          new Date(a.allocatedAt).getTime() -
          new Date(b.allocatedAt).getTime(),
      );
    case "unread_desc":
      return copy.sort((a, b) => {
        const d = b.unreadFromStudent - a.unreadFromStudent;
        return d !== 0 ? d : name(a, b);
      });
    default:
      return copy;
  }
}

export default function TutorStudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TuteeSort>("name_asc");
  const { data: rawList, isLoading } = useTutorMyStudents();

  const filteredSorted = useMemo(() => {
    const list = rawList ?? [];
    const filtered = list.filter((s) => matchesSearch(s, search));
    return sortTutees(filtered, sort);
  }, [rawList, search, sort]);

  const allStudents = useMemo(
    () => filteredSorted.map(toStudentRow),
    [filteredSorted],
  );

  const total = allStudents.length;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return allStudents.slice(start, start + limit);
  }, [allStudents, page, limit]);

  const headerActions = useMemo(
    () => (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ xs: "stretch", sm: "center" }}
        useFlexGap
        sx={{ width: { xs: "100%", md: "auto" } }}
      >
        <TextField
          size="small"
          placeholder="Search name, email, program…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 20, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            ...outlinedSoftSx,
            width: { xs: "100%", sm: 260 },
          }}
        />
        <FormControl
          size="small"
          sx={{
            ...outlinedSoftSx,
            width: { xs: "100%", sm: 200 },
          }}
        >
          <InputLabel id="tutor-students-sort">Sort by</InputLabel>
          <Select
            labelId="tutor-students-sort"
            label="Sort by"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as TuteeSort);
              setPage(1);
            }}
          >
            <MenuItem value="name_asc">Name (A–Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z–A)</MenuItem>
            <MenuItem value="allocated_desc">Newest assigned first</MenuItem>
            <MenuItem value="allocated_asc">Oldest assigned first</MenuItem>
            <MenuItem value="unread_desc">Unread messages first</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    ),
    [search, sort],
  );

  if (isLoading && !rawList) {
    return (
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          display: "flex",
          justifyContent: "center",
          py: 10,
          bgcolor: "#f5f6fa",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: "1400px",
        mx: "auto",
        bgcolor: "#f5f6fa",
        minHeight: "100vh",
      }}
    >
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
        headerActions={headerActions}
        onStudentDocuments={(id) =>
          router.push(`/tutor/students/${id}/documents`)
        }
      />
    </Box>
  );
}

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Stack,
  Button,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import PageHeader from "./TableHeader";

export interface Column<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (value: any) => string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  // isLoading: boolean;
  // error: Error | null;
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export const DataTable = <T extends { id: string }>({
  columns,
  data,
  // isLoading,
  // error,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) => {
  const totalPages = Math.ceil(total / limit);
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;
  // if (error) {
  //   return (
  //     <Box sx={{ p: 2 }}>
  //       <Typography color="error">
  //         Error loading data: {error.message}
  //       </Typography>
  //     </Box>
  //   );
  // }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Stack spacing={3}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.id)}
                    align={column.align || "left"}
                    style={{ minWidth: column.minWidth || 100 }}
                    sx={{ fontWeight: 600 }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    sx={{ textAlign: "center", py: 4 }}
                  >
                    <Typography color="textSecondary">No data found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row) => (
                  <TableRow hover key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={String(column.id)}
                          align={column.align || "left"}
                        >
                          {column.render
                            ? column.render(value, row)
                            : column.format
                              ? column.format(value)
                              : String(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Custom Pagination UI */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          {/* Left: Rows per page dropdown */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <Select
                value={limit}
                onChange={(e) => {
                  onLimitChange(parseInt(e.target.value as string));
                  onPageChange(1);
                }}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d0d0d0",
                  },
                }}
              >
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={40}>40</MenuItem>
                <MenuItem value={60}>60</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Center: Page info */}
          <Typography variant="body2" sx={{ color: "textSecondary" }}>
            Page {page} of {totalPages} | Total: {total} records
          </Typography>

          {/* Right: Previous and Next buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ChevronLeft />}
              onClick={() => onPageChange(page - 1)}
              disabled={!canGoPrev}
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              endIcon={<ChevronRight />}
              onClick={() => onPageChange(page + 1)}
              disabled={!canGoNext}
              sx={{
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};

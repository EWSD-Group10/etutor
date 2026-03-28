"use client";

import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Button,
} from "@mui/material";
import { Allocation } from "@/app/hooks/allocations/query";

interface AssignedStudentsTableProps {
  data: Allocation[];
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onDetails?: (allocation: Allocation) => void;
}

export const AssignedStudentsTable: React.FC<AssignedStudentsTableProps> = ({
  data,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onDetails,
}) => {
  const handleChangePage = (event: unknown, newPage: number) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    onLimitChange(parseInt(event.target.value, 10));
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tutor</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((allocation) => (
                <TableRow
                  key={allocation.id}
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell>
                    <Box>
                      <Box sx={{ fontWeight: 500 }}>
                        {allocation.studentName}
                      </Box>
                      <Box sx={{ fontSize: "0.875rem", color: "#666" }}>
                        {allocation.studentEmail}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Box sx={{ fontWeight: 500 }}>{allocation.tutorName}</Box>
                      <Box sx={{ fontSize: "0.875rem", color: "#666" }}>
                        {allocation.tutorEmail}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onDetails?.(allocation)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ py: 4, color: "#999" }}
                >
                  No assigned students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 20, 50]}
        component="div"
        count={total}
        rowsPerPage={limit}
        page={page - 1}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

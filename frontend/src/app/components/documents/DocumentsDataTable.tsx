"use client";

import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DocumentFileTypeIcon from "./DocumentFileTypeIcon";
import DocumentFormatBadge from "./DocumentFormatBadge";
import {
  getFormatCategory,
  formatFileSize,
  type DocumentFormatCategory,
} from "./documentFormatUtils";

export interface DocumentTableRow {
  id: string;
  fileName: string;
  fileFormat?: string | null;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  uploaderId: string;
}

interface DocumentsDataTableProps {
  rows: DocumentTableRow[];
  canEditRow?: (row: DocumentTableRow) => boolean;
  canDeleteRow?: (row: DocumentTableRow) => boolean;
  onView?: (row: DocumentTableRow) => void;
  onEdit?: (row: DocumentTableRow) => void;
  onComment?: (row: DocumentTableRow) => void;
  onDelete?: (row: DocumentTableRow) => void;
  /** When false, hide the edit action column controls */
  showEdit?: boolean;
}

const DocumentsDataTable: React.FC<DocumentsDataTableProps> = ({
  rows,
  canEditRow = () => true,
  canDeleteRow = () => true,
  onView,
  onEdit,
  onDelete,
  onComment,
  showEdit = true,
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha("#000", 0.08),
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
      }}
    >
      <Table size="medium" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow sx={{ bgcolor: alpha("#000", 0.02) }}>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary", py: 2 }}>
              File Name
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Format
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Size
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Uploaded By
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Date
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, color: "text.secondary", pr: 2 }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} sx={{ py: 8, textAlign: "center" }}>
                <Typography color="text.secondary" fontWeight={600}>
                  No files match your filters
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => {
              const category: DocumentFormatCategory = getFormatCategory(
                row.fileName,
                row.fileFormat,
              );
              const dateStr = row.uploadedAt
                ? new Date(row.uploadedAt).toLocaleDateString()
                : "—";
              return (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    "&:last-child td": { borderBottom: 0 },
                    "& td": { py: 2 },
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <DocumentFileTypeIcon category={category} />
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {row.fileName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <DocumentFormatBadge category={category} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatFileSize(row.sizeBytes)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {row.uploadedBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {dateStr}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {onView && (
                      <Tooltip title="Download / view">
                        <IconButton
                          size="small"
                          onClick={() => onView(row)}
                          sx={{ color: "text.secondary" }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {showEdit && onEdit && (
                      <Tooltip title="Edit">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!canEditRow(row)}
                            onClick={() => onEdit(row)}
                            sx={{ color: "text.secondary" }}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {onComment && (
                      <Tooltip title="Comments">
                        <span>
                          <IconButton
                            size="small"
                            onClick={() => onComment(row)}
                            sx={{ color: "text.secondary" }}
                          >
                            <ChatBubbleOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip title="Delete">
                        <span>
                          <IconButton
                            size="small"
                            disabled={!canDeleteRow(row)}
                            onClick={() => onDelete(row)}
                            sx={{ color: "error.main" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentsDataTable;

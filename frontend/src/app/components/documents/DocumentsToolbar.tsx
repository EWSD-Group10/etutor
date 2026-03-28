"use client";

import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

/** Toolbar filters only (no "other" — uploads are restricted to these types) */
export type DocumentsFilterValue = "all" | "pdf" | "doc" | "xls" | "ppt";

interface DocumentsToolbarProps {
  filter: DocumentsFilterValue;
  onFilterChange: (value: DocumentsFilterValue) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const FILTERS: { value: DocumentsFilterValue; label: string }[] = [
  { value: "all", label: "all" },
  { value: "pdf", label: "pdf" },
  { value: "doc", label: "doc" },
  { value: "xls", label: "xls" },
  { value: "ppt", label: "ppt" },
];

const DocumentsToolbar: React.FC<DocumentsToolbarProps> = ({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 2,
      }}
    >
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_e, v: DocumentsFilterValue | null) => {
          if (v != null) onFilterChange(v);
        }}
        size="small"
        sx={{
          flexWrap: "wrap",
          "& .MuiToggleButton-root": {
            textTransform: "lowercase",
            fontWeight: 600,
            px: 2,
            borderRadius: "8px !important",
            border: "1px solid",
            borderColor: "divider",
            mr: 0.5,
            mb: 0.5,
            "&.Mui-selected": {
              bgcolor: "action.selected",
              color: "text.primary",
            },
          },
        }}
      >
        {FILTERS.map((f) => (
          <ToggleButton key={f.value} value={f.value}>
            {f.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <TextField
        size="small"
        placeholder="Search files..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          minWidth: 280,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            bgcolor: "#00000005",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: "transparent" },
            "&.Mui-focused fieldset": { borderColor: "transparent" },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default DocumentsToolbar;

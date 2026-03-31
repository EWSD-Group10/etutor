"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { DocumentRecord } from "@/app/hooks/documents/query";

interface UploadDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<DocumentRecord>;
  isUploading?: boolean;
  /** e.g. ".pdf,.doc,.docx" — narrows system file picker */
  accept?: string;
  /** Shown under the button */
  hint?: string;
  /** Return an error message to block upload, or null if OK */
  validateBeforeUpload?: (file: File) => string | null;
}

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({
  open,
  onClose,
  onUpload,
  isUploading = false,
  accept,
  hint,
  validateBeforeUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isUploading) return;

    if (validateBeforeUpload) {
      const validationError = validateBeforeUpload(file);
      if (validationError) {
        window.alert(validationError);
        return;
      }
    }

    try {
      await onUpload(file);
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Upload failed";
      window.alert(msg);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isUploading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Upload document</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 1 }}>
          <input
            ref={inputRef}
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
          />
          <Button
            variant="outlined"
            startIcon={
              isUploading ? <CircularProgress size={18} /> : <CloudUploadIcon />
            }
            onClick={handlePick}
            disabled={isUploading}
            fullWidth
            sx={{ py: 2, textTransform: "none", fontWeight: 600 }}
          >
            {isUploading ? "Uploading…" : "Choose file"}
          </Button>
          {hint && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.5 }}
            >
              {hint}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={isUploading}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDocumentDialog;

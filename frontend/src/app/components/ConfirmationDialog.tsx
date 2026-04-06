"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface ConfirmationDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  confirmColor?:
    | "primary"
    | "error"
    | "inherit"
    | "secondary"
    | "success"
    | "warning";
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  showCancel = true,
  confirmColor = "primary",
  onClose,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent sx={{ pt: title ? 1 : 2, pb: 2 }}>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {showCancel && (
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            {cancelLabel}
          </Button>
        )}
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          sx={{ textTransform: "none" }}
        >
          {confirmLabel ?? (showCancel ? "Confirm" : "OK")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

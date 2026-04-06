"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
} from "@mui/material";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import { useDocumentComments } from "@/app/hooks/documents/useDocuments";
import { useAddDocumentComment } from "@/app/hooks/documents/useDocumentMutations";

interface DocumentCommentsDialogProps {
  open: boolean;
  documentId: string | null;
  documentName: string;
  onClose: () => void;
}

export default function DocumentCommentsDialog({
  open,
  documentId,
  documentName,
  onClose,
}: DocumentCommentsDialogProps) {
  const [newComment, setNewComment] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useDocumentComments(
    documentId || "",
    { enabled: Boolean(open && documentId) },
  );

  const addComment = useAddDocumentComment();

  useEffect(() => {
    if (open && documentId) {
      refetch();
    }
  }, [open, documentId, refetch]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !documentId) return;

    try {
      await addComment.mutateAsync({
        documentId,
        commentText: newComment,
      });
      setNewComment("");
      refetch();
    } catch (err) {
      console.error("Failed to send document comment", err);
      setAlertMessage("Failed to send comment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Comments: {documentName}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : isError ? (
          <Typography color="error">Could not load comments.</Typography>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {(data?.data || []).length === 0 ? (
              <Typography color="text.secondary">No comments yet.</Typography>
            ) : (
              (data?.data || []).map((comment) => (
                <Box
                  key={comment.id}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Avatar sx={{ width: 26, height: 26, fontSize: 12 }}>
                      {comment.commenter.name
                        ? comment.commenter.name.charAt(0).toUpperCase()
                        : "?"}
                    </Avatar>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {comment.commenter.name || "Unknown"}
                    </Typography>
                    <Chip
                      label={comment.commenter.role}
                      size="small"
                      color={
                        comment.commenter.role === "tutor"
                          ? "primary"
                          : "default"
                      }
                      sx={{ ml: 1 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: "auto" }}
                    >
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {comment.commentText}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            label="Write a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            minRows={2}
            maxRows={4}
            fullWidth
            // disabled={addComment.isLoading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={handleSendComment}
          //   disabled={!newComment.trim() || addComment.isLoading}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>

    <ConfirmationDialog
      open={Boolean(alertMessage)}
      title="Failed to send comment"
      message={alertMessage ?? ""}
      showCancel={false}
      confirmLabel="OK"
      onClose={() => setAlertMessage(null)}
      onConfirm={() => setAlertMessage(null)}
    />
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadDocumentFile,
  deleteDocument,
  addDocumentComment,
} from "./query";
import { documentKeys } from "./useDocuments";

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocumentFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
};

export const useAddDocumentComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      commentText,
    }: {
      documentId: string;
      commentText: string;
    }) => addDocumentComment(documentId, commentText),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.list() });
      queryClient.invalidateQueries({
        queryKey: ["documents", "comments", documentId],
      });
    },
  });
};

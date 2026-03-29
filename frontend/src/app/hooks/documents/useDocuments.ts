import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchDocuments, fetchDocumentComments } from "./query";
import type { DocumentsListResponse, DocumentCommentsResponse } from "./query";

export const documentKeys = {
  all: ["documents"] as const,
  list: (filterByStudentId?: string) =>
    [...documentKeys.all, "list", filterByStudentId ?? "mine"] as const,
};

type DocsQueryOptions = Omit<
  UseQueryOptions<DocumentsListResponse, Error>,
  "queryKey" | "queryFn"
>;

/** @param filterByStudentId — tutor: pass assigned student id to list only their uploads */
export const useDocuments = (
  filterByStudentId?: string,
  options?: DocsQueryOptions,
) => {
  const defaultEnabled =
    filterByStudentId === undefined || filterByStudentId.length > 0;
  return useQuery({
    queryKey: documentKeys.list(filterByStudentId),
    queryFn: () => fetchDocuments(filterByStudentId),
    ...options,
    enabled: options?.enabled !== undefined ? options.enabled : defaultEnabled,
  });
};

type DocCommentsQueryOptions = Omit<
  UseQueryOptions<DocumentCommentsResponse, Error>,
  "queryKey" | "queryFn"
>;

export const useDocumentComments = (
  documentId: string,
  options?: DocCommentsQueryOptions,
) => {
  return useQuery({
    queryKey: ["documents", "comments", documentId],
    queryFn: () => fetchDocumentComments(documentId),
    enabled:
      options?.enabled === undefined ? Boolean(documentId) : options.enabled,
    ...options,
  });
};

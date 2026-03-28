import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { fetchDocuments } from "./query";
import type { DocumentsListResponse } from "./query";

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
export const useDocuments = (filterByStudentId?: string, options?: DocsQueryOptions) => {
  const defaultEnabled =
    filterByStudentId === undefined || filterByStudentId.length > 0;
  return useQuery({
    queryKey: documentKeys.list(filterByStudentId),
    queryFn: () => fetchDocuments(filterByStudentId),
    ...options,
    enabled:
      options?.enabled !== undefined ? options.enabled : defaultEnabled,
  });
};

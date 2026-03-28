import { useQuery } from "@tanstack/react-query";
import { fetchDocuments } from "./query";

export const documentKeys = {
  all: ["documents"] as const,
  list: () => [...documentKeys.all, "list"] as const,
};

export const useDocuments = () => {
  return useQuery({
    queryKey: documentKeys.list(),
    queryFn: fetchDocuments,
  });
};

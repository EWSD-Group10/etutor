import { useQuery } from "@tanstack/react-query";
import {
  fetchAllocations,
  fetchAllocationStats,
  fetchUnassignedStudents,
} from "./query";

export const useAllocations = (
  page: number = 1,
  limit: number = 20,
  status: "all" | "assigned" | "unassigned" = "all",
) => {
  return useQuery({
    queryKey: ["allocations", page, limit, status],
    queryFn: () => fetchAllocations(page, limit, status),
  });
};

export const useAllocationStats = () => {
  return useQuery({
    queryKey: ["allocationStats"],
    queryFn: fetchAllocationStats,
  });
};

export const useUnassignedStudents = () => {
  return useQuery({
    queryKey: ["unassignedStudents"],
    queryFn: fetchUnassignedStudents,
  });
};

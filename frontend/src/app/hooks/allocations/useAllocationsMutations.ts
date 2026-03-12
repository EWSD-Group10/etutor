import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAllocation,
  bulkCreateAllocations,
  updateAllocation,
  deleteAllocation,
  CreateAllocationInput,
  BulkAllocationInput,
  UpdateAllocationInput,
} from "./mutations";
import { Allocation } from "./query";

export const useCreateAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation<Allocation, Error, CreateAllocationInput>({
    mutationFn: createAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["allocationStats"] });
    },
  });
};

export const useBulkCreateAllocations = () => {
  const queryClient = useQueryClient();
  return useMutation<Allocation[], Error, BulkAllocationInput>({
    mutationFn: bulkCreateAllocations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["allocationStats"] });
    },
  });
};

export const useUpdateAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation<Allocation, Error, UpdateAllocationInput>({
    mutationFn: updateAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["allocationStats"] });
    },
  });
};

export const useDeleteAllocation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteAllocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allocations"] });
      queryClient.invalidateQueries({ queryKey: ["allocationStats"] });
    },
  });
};

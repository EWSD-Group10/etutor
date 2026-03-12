import axios from "../../../lib/axios";
import { Allocation } from "./query";

export interface CreateAllocationInput {
  tutorId: string;
  studentId: string;
  reason?: string;
  notes?: string;
}

export interface BulkAllocationInput {
  tutorId: string;
  studentIds: string[];
  reason?: string;
  notes?: string;
}

export interface UpdateAllocationInput {
  id: string;
  tutorId: string;
  reason?: string;
  notes?: string;
}

export const createAllocation = async (
  input: CreateAllocationInput,
): Promise<Allocation> => {
  const response = await axios.post<{ data: Allocation }>("/api/allocations", {
    tutorId: input.tutorId,
    studentId: input.studentId,
    reason: input.reason,
    notes: input.notes,
  });
  return response.data.data;
};

export const bulkCreateAllocations = async (
  input: BulkAllocationInput,
): Promise<Allocation[]> => {
  const response = await axios.post<{ data: Allocation[] }>(
    "/api/allocations/bulk",
    {
      tutorId: input.tutorId,
      studentIds: input.studentIds,
      reason: input.reason,
      notes: input.notes,
    },
  );
  return response.data.data;
};

export const updateAllocation = async (
  input: UpdateAllocationInput,
): Promise<Allocation> => {
  const { id, ...rest } = input;
  const response = await axios.put<{ data: Allocation }>(
    `/api/allocations/${id}`,
    rest,
  );
  return response.data.data;
};

export const deleteAllocation = async (id: string): Promise<void> => {
  await axios.delete(`/api/allocations/${id}`);
};

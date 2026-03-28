import axios from "../../../lib/axios";

export interface Allocation {
  id: string;
  studentId: string;
  tutorId: string;
  studentName: string;
  studentEmail: string;
  tutorName: string;
  tutorEmail: string;
  reason?: string;
  notes?: string;
  allocatedAt: string;
}

export interface AllocationStats {
  totalAllocations: number;
  unassignedStudents: number;
  activeTutors: number;
  avgStudentsPerTutor: number;
}

export interface AllocationsResponse {
  data: Allocation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AllocationResponse {
  data: Allocation;
}

export interface UnassignedStudent {
  id: string;
  name: string;
  email: string;
  degreeProgram: string;
  year?: number;
}

export interface UnassignedStudentsResponse {
  data: UnassignedStudent[];
}

export const fetchAllocations = async (
  page: number = 1,
  limit: number = 20,
  status: "all" | "assigned" | "unassigned" = "all",
): Promise<AllocationsResponse> => {
  const response = await axios.get<AllocationsResponse>("/api/allocations", {
    params: { page, limit, status },
  });
  return response.data;
};

export const fetchAllocationStats = async (): Promise<AllocationStats> => {
  const response = await axios.get<AllocationStats>("/api/allocations/stats");
  return response.data;
};

export const fetchUnassignedStudents =
  async (): Promise<UnassignedStudentsResponse> => {
    const response = await axios.get<UnassignedStudentsResponse>(
      "/api/students/unassigned",
    );
    return response.data;
  };

export const fetchAllocation = async (id: string): Promise<Allocation> => {
  const response = await axios.get<AllocationResponse>(
    `/api/allocations/${id}`,
  );
  return response.data.data;
};

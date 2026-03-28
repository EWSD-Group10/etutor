import axios from "../../../lib/axios";

export interface Student {
  id: string;
  email: string;
  name: string;
  role: string;
  degreeProgram: string;
  isActive: boolean;
  createdAt: string;
  /** Tutor "My students" list only */
  allocatedAt?: string;
  unreadFromStudent?: number;
}

export interface StudentsResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentResponse {
  data: Student;
}

export const fetchStudents = async (
  page: number = 1,
  limit: number = 20,
): Promise<StudentsResponse> => {
  const response = await axios.get<StudentsResponse>("/api/students", {
    params: { page, limit },
  });
  return response.data;
};

export const fetchStudent = async (id: string): Promise<Student> => {
  const response = await axios.get<StudentResponse>(`/api/students/${id}`);
  return response.data.data;
};

import { useQuery } from "@tanstack/react-query";
import axios from "../../../lib/axios";

interface Student {
  id: string;
  email: string;
  name: string;
  role: string;
  degreeProgram: string;
  isActive: boolean;
  createdAt: string;
}

interface StudentsResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await axios.get<StudentsResponse>("/api/students", {});
      return response.data;
    },
  });
};

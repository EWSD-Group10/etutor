import axios from "../../../lib/axios";

export interface Tutor {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  isActive: boolean;
  createdAt: string;
}

export interface TutorsResponse {
  data: Tutor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TutorResponse {
  data: Tutor;
}

export const fetchTutors = async (
  page: number = 1,
  limit: number = 20,
): Promise<TutorsResponse> => {
  const response = await axios.get<TutorsResponse>("/api/tutors", {
    params: { page, limit },
  });
  return response.data;
};

export const fetchTutor = async (id: string): Promise<Tutor> => {
  const response = await axios.get<TutorResponse>(`/api/tutors/${id}`);
  return response.data.data;
};

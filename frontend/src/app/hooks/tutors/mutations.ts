import axios from "../../../lib/axios";
import { Tutor, TutorsResponse } from "./query";

export interface CreateTutorInput {
  fullName: string;
  email: string;
  degreeProgram: string;
  department: string;
}

export interface UpdateTutorInput {
  id: string;
  fullName?: string;
  email?: string;
  degreeProgram?: string;
  department?: string;
}

export const createTutor = async (input: CreateTutorInput): Promise<Tutor> => {
  const response = await axios.post<{ data: Tutor }>("/api/tutors", {
    name: input.fullName,
    email: input.email,
    degreeProgram: input.degreeProgram,
    department: input.department,
  });
  return response.data.data;
};

export const updateTutor = async (input: UpdateTutorInput): Promise<Tutor> => {
  const { id, ...rest } = input;
  const response = await axios.put<{ data: Tutor }>(`/api/tutors/${id}`, {
    ...(rest.fullName !== undefined && { name: rest.fullName }),
    ...(rest.email !== undefined && { email: rest.email }),
    ...(rest.degreeProgram !== undefined && {
      degreeProgram: rest.degreeProgram,
    }),
    ...(rest.department !== undefined && { department: rest.department }),
  });
  return response.data.data;
};

export const deleteTutor = async (id: string): Promise<void> => {
  await axios.delete(`/api/tutors/${id}`);
};

import axios from "../../../lib/axios";
import { Student, StudentsResponse } from "./query";

export interface CreateStudentInput {
  fullName: string;
  email: string;
  degreeProgram: string;
}

export interface UpdateStudentInput {
  id: string;
  fullName?: string;
  email?: string;
  degreeProgram?: string;
}

export const createStudent = async (
  input: CreateStudentInput,
): Promise<Student> => {
  const response = await axios.post<{ data: Student }>("/api/students", {
    name: input.fullName,
    email: input.email,
    degreeProgram: input.degreeProgram,
  });
  return response.data.data;
};

export const updateStudent = async (
  input: UpdateStudentInput,
): Promise<Student> => {
  const { id, ...rest } = input;
  const response = await axios.put<{ data: Student }>(`/api/students/${id}`, {
    ...(rest.fullName !== undefined && { name: rest.fullName }),
    ...(rest.email !== undefined && { email: rest.email }),
    ...(rest.degreeProgram !== undefined && {
      degreeProgram: rest.degreeProgram,
    }),
  });
  return response.data.data;
};

export const deleteStudent = async (id: string): Promise<void> => {
  await axios.delete(`/api/students/${id}`);
};

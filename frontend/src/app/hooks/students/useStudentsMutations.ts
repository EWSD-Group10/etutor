import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  CreateStudentInput,
  UpdateStudentInput,
} from "./mutations";
import { Student } from "./query";

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, CreateStudentInput>({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<Student, Error, UpdateStudentInput>({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
};

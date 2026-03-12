import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTutor,
  updateTutor,
  deleteTutor,
  CreateTutorInput,
  UpdateTutorInput,
} from "./mutations";
import { Tutor } from "./query";

export const useCreateTutor = () => {
  const queryClient = useQueryClient();
  return useMutation<Tutor, Error, CreateTutorInput>({
    mutationFn: createTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
};

export const useUpdateTutor = () => {
  const queryClient = useQueryClient();
  return useMutation<Tutor, Error, UpdateTutorInput>({
    mutationFn: updateTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
};

export const useDeleteTutor = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTutor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { fetchTutors, fetchTutorMyStudents, TutorsResponse } from "./query";

export const useTutors = (page: number = 1, limit: number = 20) => {
  return useQuery<TutorsResponse>({
    queryKey: ["tutors", page, limit],
    queryFn: () => fetchTutors(page, limit),
  });
};

export const useTutorMyStudents = (enabled = true) => {
  return useQuery({
    queryKey: ["tutorMyStudents"],
    queryFn: fetchTutorMyStudents,
    enabled,
  });
};

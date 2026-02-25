import { useQuery } from "@tanstack/react-query";
import { fetchTutors, TutorsResponse } from "./query";

export const useTutors = (page: number = 1, limit: number = 20) => {
  return useQuery<TutorsResponse>({
    queryKey: ["tutors", page, limit],
    queryFn: () => fetchTutors(page, limit),
  });
};

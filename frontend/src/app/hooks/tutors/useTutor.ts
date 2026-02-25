import { useQuery } from "@tanstack/react-query";
import { fetchTutor, Tutor } from "./query";

export const useTutor = (id: string) => {
  return useQuery<Tutor>({
    queryKey: ["tutor", id],
    queryFn: () => fetchTutor(id),
    enabled: !!id, // Only fetch if id is provided
  });
};

import { useQuery } from "@tanstack/react-query";
import { fetchStudents, StudentsResponse } from "./query";

export const useStudents = (page: number = 1, limit: number = 20) => {
  return useQuery<StudentsResponse>({
    queryKey: ["students", page, limit],
    queryFn: () => fetchStudents(page, limit),
  });
};

import { useQuery } from "@tanstack/react-query";
import { fetchStudent, Student } from "./query";

export const useStudent = (id: string) => {
  return useQuery<Student>({
    queryKey: ["student", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id, // Only fetch if id is provided
  });
};

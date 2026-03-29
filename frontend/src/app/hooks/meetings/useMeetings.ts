import { useQuery } from "@tanstack/react-query";
import { fetchMeetings, fetchAllMeetings, MeetingsResponse } from "./query";

export type MeetingStatus = "pending" | "scheduled" | "completed" | "cancelled" | undefined;

// Hook to fetch meetings with pagination and status filter
export const useMeetings = (
  page: number = 1,
  limit: number = 20,
  status?: MeetingStatus
) => {
  return useQuery<MeetingsResponse>({
    queryKey: ["meetings", page, limit, status],
    queryFn: () => fetchMeetings(page, limit, status),
  });
};

// Hook to fetch all meetings (admin only)
export const useAllMeetings = (page: number = 1, limit: number = 20) => {
  return useQuery<MeetingsResponse>({
    queryKey: ["adminMeetings", page, limit],
    queryFn: () => fetchAllMeetings(page, limit),
  });
};

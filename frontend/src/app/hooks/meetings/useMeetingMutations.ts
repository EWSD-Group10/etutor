import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createMeeting, updateMeetingStatus } from "./mutations";
import { CreateMeetingInput } from "./query";

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingInput) => createMeeting(input),
    onSuccess: () => {
      // Invalidate meetings queries to refetch
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
};

export const useUpdateMeetingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      meetingStatus,
    }: {
      meetingId: string;
      meetingStatus: string;
    }) => updateMeetingStatus(meetingId, meetingStatus),
    onSuccess: () => {
      // Invalidate meetings queries to refetch
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
};

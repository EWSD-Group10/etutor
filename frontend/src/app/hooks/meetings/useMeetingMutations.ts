import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createMeeting, updateMeeting } from "./mutations";
import { CreateMeetingInput, UpdateMeetingInput } from "./query";

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMeetingInput) => createMeeting(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: () => {
      toast.error("Failed to create meeting. Please try again.");
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ meetingId, input }: { meetingId: string; input: UpdateMeetingInput }) =>
      updateMeeting(meetingId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error("This meeting is no longer available for acceptance.");
      } else if (status === 403) {
        toast.error("You don't have permission to perform this action.");
      } else {
        toast.error("Failed to update meeting. Please try again.");
      }
    },
  });
};

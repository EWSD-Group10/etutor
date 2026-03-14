import api from "../../../lib/axios";
import { Meeting, CreateMeetingInput, MeetingResponse } from "./query";

export const createMeeting = async (input: CreateMeetingInput): Promise<Meeting> => {
  const response = await api.post<MeetingResponse>("/api/meetings", input);
  return response.data.data;
};

export const updateMeetingStatus = async (
  meetingId: string,
  meetingStatus: string
): Promise<Meeting> => {
  const response = await api.patch<MeetingResponse>(`/api/meetings/${meetingId}/status`, {
    meetingStatus,
  });
  return response.data.data;
};

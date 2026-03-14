import api from "../../../lib/axios";
import { Meeting, CreateMeetingInput, UpdateMeetingInput, MeetingResponse } from "./query";

export const createMeeting = async (input: CreateMeetingInput): Promise<Meeting> => {
  const response = await api.post<MeetingResponse>("/api/meetings", input);
  return response.data.data;
};

export const updateMeeting = async (
  meetingId: string,
  input: UpdateMeetingInput
): Promise<Meeting> => {
  const response = await api.put<MeetingResponse>(`/api/meetings/${meetingId}`, input);
  return response.data.data;
};

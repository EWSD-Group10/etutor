import api from "../../../lib/axios";

export interface MeetingUser {
  id: string;
  name: string;
  email: string;
}

export interface Meeting {
  id: string;
  meetingType: string;
  meetingStatus: string;
  scheduledAt: string;
  durationMinutes: number;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  createdAt: string;
  student: MeetingUser;
  tutor: MeetingUser;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface MeetingsResponse {
  data: Meeting[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MeetingResponse {
  data: Meeting;
}

export interface CreateMeetingInput {
  tutorId?: string;
  studentId?: string;
  meetingType?: string;
  scheduledAt: string;
  durationMinutes?: number;
  location?: string;
  meetingLink?: string;
  notes?: string;
}

// Fetch meetings with pagination and optional status filter
export const fetchMeetings = async (
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<MeetingsResponse> => {
  const params: Record<string, string | number> = { page, limit };
  if (status) {
    params.status = status;
  }
  const response = await api.get<MeetingsResponse>("/api/meetings", {
    params,
  });
  return response.data;
};

// Fetch all meetings (admin only)
export const fetchAllMeetings = async (
  page: number = 1,
  limit: number = 20
): Promise<MeetingsResponse> => {
  const response = await api.get<MeetingsResponse>("/api/admin/meetings", {
    params: { page, limit },
  });
  return response.data;
};

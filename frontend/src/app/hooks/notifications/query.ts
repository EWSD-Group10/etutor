import api from "../../../lib/axios";

export type NotificationType =
  | "tutor_assigned"
  | "tutor_reallocated"
  | "meeting_scheduled"
  | "meeting_pending"
  | "meeting_accepted"
  | "meeting_rejected"
  | "meeting_updated"
  | "new_document"
  | "student_assigned";

export interface NotificationMetadata {
  tutorId?: string;
  tutorName?: string;
  previousTutorName?: string;
  meetingId?: string;
  meetingName?: string | null;
  scheduledAt?: string;
  meetingType?: string;
  location?: string | null;
  meetingLink?: string | null;
  meetingStatus?: string;
  documentId?: string;
  fileName?: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: NotificationMetadata | null;
  createdAt: string;
}

export interface NotificationsStats {
  total: number;
  unread: number;
  pendingActions: number;
}

export interface NotificationsResponse {
  data: Notification[];
  stats: NotificationsStats;
}

export type NotificationFilter = "all" | "unread" | "allocations" | "meetings" | "documents";

export const fetchNotifications = async (
  filter?: NotificationFilter,
  search?: string
): Promise<NotificationsResponse> => {
  const params: Record<string, string> = {};
  if (filter && filter !== "all") params.filter = filter;
  if (search) params.search = search;
  const response = await api.get<NotificationsResponse>("/api/notifications", { params });
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.put(`/api/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.put("/api/notifications/read-all");
};

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NotificationFilter,
} from "./query";

export const NOTIFICATIONS_KEY = "notifications";

export const useNotifications = (filter?: NotificationFilter, search?: string) => {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, filter, search],
    queryFn: () => fetchNotifications(filter, search),
    refetchInterval: 10000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] });
    },
  });
};

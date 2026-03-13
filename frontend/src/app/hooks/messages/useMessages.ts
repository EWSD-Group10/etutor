import { useQuery } from "@tanstack/react-query";
import {
  fetchMessages,
  fetchInbox,
  fetchMessageContacts,
  InboxItem,
  MessageContact,
  Message,
} from "./query";

export interface MessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Hook to fetch messages with a specific user (paginated)
export const useMessages = (withUserId: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["messages", withUserId, page, limit],
    queryFn: () => fetchMessages(withUserId, page, limit),
    enabled: !!withUserId,
  });
};

// Hook to fetch inbox (list of conversations)
export const useInbox = () => {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
  });
};

// Hook to fetch message contacts
export const useMessageContacts = () => {
  return useQuery({
    queryKey: ["messageContacts"],
    queryFn: fetchMessageContacts,
  });
};

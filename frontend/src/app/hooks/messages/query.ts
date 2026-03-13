import axios from "../../../lib/axios";

export interface MessageUser {
  id: string;
  name: string;
  role: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: MessageUser;
  recipient: MessageUser;
}

export interface MessagesResponse {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface InboxItem {
  peer: MessageUser;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    readAt: string | null;
  };
  unreadCount: number;
}

export interface InboxResponse {
  data: InboxItem[];
}

export interface MessageContact {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  degreeProgram: string | null;
}

export interface ContactsResponse {
  data: MessageContact[];
}

// Fetch messages with a specific user (paginated)
export const fetchMessages = async (
  withUserId: string,
  page: number = 1,
  limit: number = 20
): Promise<MessagesResponse> => {
  const response = await axios.get<MessagesResponse>("/api/messages", {
    params: { withUserId, page, limit },
  });
  return response.data;
};

// Fetch inbox (list of conversations)
export const fetchInbox = async (): Promise<InboxResponse> => {
  const response = await axios.get<InboxResponse>("/api/messages/inbox");
  return response.data;
};

// Fetch message contacts (visible users to message)
export const fetchMessageContacts = async (): Promise<ContactsResponse> => {
  const response = await axios.get<ContactsResponse>("/api/messages/contacts");
  return response.data;
};

import api from "../../../lib/axios";
import { Message } from "./query";

export interface SendMessageResponse {
  data: Message;
}

export interface SendMessageInput {
  recipientId: string;
  content: string;
}

// Send a message
export const sendMessage = async (input: SendMessageInput): Promise<Message> => {
  const response = await api.post<SendMessageResponse>("/api/messages", input);
  return response.data.data;
};

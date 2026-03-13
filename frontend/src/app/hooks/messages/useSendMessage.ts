import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, SendMessageInput } from "./mutations";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SendMessageInput) => sendMessage(input),
    onSuccess: () => {
      // Invalidate messages and inbox queries to refetch
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
};

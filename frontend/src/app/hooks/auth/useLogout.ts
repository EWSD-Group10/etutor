import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { logout } from "./logout";

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Redirect to login page after logout
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still redirect to login even if logout fails
      router.push("/login");
    },
  });
};

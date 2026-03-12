import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { logout } from "./logout";

export const useLogout = () => {
  const router = useRouter();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear user from AuthContext
      setUser(null);
      // Redirect to login page after logout
      router.push("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      // Still clear user and redirect even if logout fails
      setUser(null);
      router.push("/login");
    },
  });
};

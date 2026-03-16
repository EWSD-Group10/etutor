import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import api from "../../../lib/axios";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  lastLoginAt: string | null;
}

export const useLogin = () => {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginInput): Promise<LoginResponse> => {
      const response = await api.post<LoginResponse>("/api/login", data, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update AuthContext
      setUser(data.user);

      const isProduction = window.location.protocol === "https:";
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=Lax${isProduction ? "; Secure" : ""}`;

      const role = data.user.role.toLowerCase();
      let destination = "/";
      if (role === "admin") {
        destination = "/admin/dashboard";
      } else if (role === "tutor") {
        destination = "/tutor/dashboard";
      } else if (role === "student") {
        destination = "/student/dashboard";
      }

      // Pass lastLoginAt via query param so the dashboard can show a toast
      const loginParam = data.lastLoginAt
        ? `lastLoginAt=${encodeURIComponent(data.lastLoginAt)}`
        : "lastLoginAt=first";
      destination += `?${loginParam}`;

      // Use window.location for a full navigation to avoid React DOM
      // conflicts between unmounting the login page and the concurrent
      // AuthContext re-render triggered by setUser above.
      window.location.href = destination;
    },
  });
};

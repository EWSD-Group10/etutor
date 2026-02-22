import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
}

export const useLogin = () => {
  const router = useRouter();

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

      const isProduction = window.location.protocol === "https:";
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=Lax${isProduction ? "; Secure" : ""}`;

      const role = data.user.role.toLowerCase();
      if (role === "admin") {
        router.push("/admin/dashboard");
      } else if (role === "tutor") {
        router.push("/tutor/dashboard");
      } else {
        router.push("/");
      }
    },
  });
};

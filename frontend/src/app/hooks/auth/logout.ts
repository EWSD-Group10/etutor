import axios from "../../../lib/axios";

export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint on backend to clear refresh token
    // Must include withCredentials to send cookies to backend
    await axios.post("/api/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Logout API error:", error);
    // Continue with client-side cleanup even if API call fails
  }
  // Clear localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  // Clear accessToken cookie
  document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

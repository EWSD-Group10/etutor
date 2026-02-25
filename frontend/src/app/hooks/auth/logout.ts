import axios from "../../../lib/axios";

export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint on backend to clear refresh token
    await axios.post("/api/logout");
  } catch (error) {
    console.error("Logout API error:", error);
    // Continue with client-side cleanup even if API call fails
  }
  // Clear localStorage/sessionStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};

import { useDispatch } from "react-redux";
import { http } from "./http.js";

// Authentication Repository - handles auth-related API calls
export const authRepository = {
  // Login user with email/username and password
  login: async (credentials) => {
    console.log("hi every one", credentials);
    const response = await http.post("/auth/login", credentials);
    console.log("Login abinashs:", response);

    // Save token to localStorage on successful login
    if (response.data) {
      // FIX: Use JSON.stringify to convert object to string
      localStorage.setItem(
        "chemiki-authToken",
        JSON.stringify({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        })
      );
    }

    return response;
  },

  signup: async (userInfo) => {
    try {
      const response = await http.post("/auth/register", userInfo);
      return response;
    } catch (error) {
      console.error("error during registration", error);
    }
  },

  otpVerification: async (otp) => {
    console.log("otp in repo:", otp);
    const response = await http.post("/auth/otp-verification", otp);
    return response;
  },
};

export default authRepository;

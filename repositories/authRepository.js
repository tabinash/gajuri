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
        "gajuri-authToken",
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
    console.log("OTP Verification Response in Repo:", response);
    return response;
  },
  forgetPassword: async (email) => {
    try {
      const response = await http.post("/auth/forgot-password", { email });
      return response;
    } catch (error) {
      console.error("Error during forget password:", error);
      throw error;
    }
  },
  resetPassword: async (data) => {
    try {
      const response = await http.post("/auth/reset-password", data);
      return response;
    } catch (error) {
      console.error("Error during reset password:", error);
      throw error;
    }
  },
};

export default authRepository;

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import authRepository from "@/repositories/authRepository";

export default function OtpPage() {
  const router = useRouter();
  const [otp, setotp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [resending, setResending] = useState(false); // Loading state for resend

  useEffect(() => {
    const data = sessionStorage.getItem("signup:data");
    const token = JSON.parse(sessionStorage.getItem("token") || "{}");
    setToken(token);
    console.log("Saved Token:", token);
    console.log("Saved Data:", JSON.parse(data || "{}"));
    
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setEmail(parsed.email || "");
      } catch {}
    }
  }, []);

  const handleChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setotp(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit otp.");
      return;
    }
    
    try {
      const response = await authRepository.otpVerification({
        email,
        otp,
        token,
      });
      console.log("OTP Verification Response:", response);
      router.push("/signup/success");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Verification failed");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setotp("");
    setError("");

    try {
      // Get the stored signup data from session
      const savedData = sessionStorage.getItem("signup:data");
      
      if (!savedData) {
        setError("Session expired. Please sign up again.");
        router.replace("/signup");
        return;
      }

      const requestData = JSON.parse(savedData);
      console.log("Resending OTP with data:", requestData);

      // Call the same register API to resend OTP
      const res = await axios.post("https://test.gajuri.com/api/auth/register", requestData);
      
      console.log("Resend OTP Response:", res.data);
      
      // Update token if new one is provided
      if (res?.data?.token) {
        sessionStorage.setItem("token", JSON.stringify(res.data.token));
        setToken(res.data.token);
      }

      // Show success message (optional)
      setError(""); // Clear any errors
      alert("OTP has been resent to your email!"); // You can replace with a toast notification
      
    } catch (err: any) {
      console.error("❌ Resend OTP failed:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          Verify your email
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 4-digit otp to {email || "your email"}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Enter 4-digit otp"
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B74E4]/40"
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9]"
          >
            Verify
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="mt-4 w-full text-sm text-gray-700 underline hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? "Resending..." : "Resend otp"}
        </button>
      </div>
    </div>
  );
}
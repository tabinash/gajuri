"use client";

import React, { useState } from "react";
import authRepository from "@/repositories/authRepository";

export default function TestSignupPage() {
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [signupToken, setSignupToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const generalPayload = {
    username: "testuser123",
    password: "Password@123",
    phoneNumber: "09871787658",
    email: "abishektiwaricsit078@chitwancollege.edu.np",
    isInstitutionalUser: false,
    dateOfBirth: "2000-01-15",
    district: "Dhading",
    palika: "Gajuri Gaunpalika",
    ward: 5,
    institutionCategory: "",
    profilePhotoUrl: "",
    coverPhotoUrl: "",
  };

  const institutionalPayload = {
    username: "instuser123",
    password: "Password@123",
    phoneNumber: "+9779800012345",
    email: "instuser123@example.com",
    isInstitutionalUser: true,
    dateOfBirth: "1995-07-20",
    district: "Dhading",
    palika: "Gajuri Gaunpalika",
    ward: 7,
    institutionCategory: "School",
    profilePhotoUrl: "",
    coverPhotoUrl: "",
  };

  const callSignupApi = async (payload: any) => {
    setLoading(true);
    setLastResult("Calling Signup API… check console.");
    try {
      console.log("[TEST SIGNUP] Sending payload:", payload);
      const res = await authRepository.signup(payload);
      const status = res?.status ?? 0;
      const data = res?.data ?? res;

      console.log("[TEST SIGNUP] Response status:", status);
      console.log("[TEST SIGNUP] Response data:", data);

      if (data?.token) {
        setSignupToken(data.token);
        setEmail(payload.email);
        setLastResult(
          `Signup success (status: ${status}) — token received. Please enter OTP to verify.`
        );
      } else {
        setLastResult(`Signup success (status: ${status}) — but no token found.`);
      }
    } catch (e: any) {
      console.error("[TEST SIGNUP] Error:", e);
      setLastResult(`Signup Error: ${e?.response?.data?.message || e?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!signupToken) {
      setLastResult("Cannot verify — token missing from signup response.");
      return;
    }
    if (!otp.trim()) {
      setLastResult("Please enter the OTP first.");
      return;
    }

    setLoading(true);
    setLastResult("Verifying OTP…");
    try {
      console.log("[OTP VERIFICATION] Email:", email, "OTP:", otp, "Token:", signupToken);
      const res = await authRepository.otpVerification({
        email,
        otp,
        token: signupToken,
      });
      console.log("[OTP VERIFICATION] Response:", res);
      setLastResult("OTP Verification success — user verified successfully.");
    } catch (e: any) {
      console.error("[OTP VERIFICATION] Error:", e);
      setLastResult(`OTP Error: ${e?.response?.data?.message || e?.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-lg font-semibold">Test Signup + OTP Verification</h1>

      <div className="flex gap-3">
        <button
          onClick={() => callSignupApi(generalPayload)}
          disabled={loading}
          className="rounded-full bg-emerald-600 px-4 py-2 text-white text-sm disabled:opacity-60"
        >
          Call with General payload
        </button>

        <button
          onClick={() => callSignupApi(institutionalPayload)}
          disabled={loading}
          className="rounded-full bg-indigo-600 px-4 py-2 text-white text-sm disabled:opacity-60"
        >
          Call with Institutional payload
        </button>
      </div>

      {signupToken && (
        <div className="border-t pt-4 mt-4 space-y-2">
          <h2 className="text-sm font-medium">OTP Verification</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border rounded px-3 py-2 text-sm w-48"
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="ml-2 rounded bg-blue-600 px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            Verify OTP
          </button>
        </div>
      )}

      <div className="text-sm text-slate-700">
        {loading ? "Loading…" : lastResult || "Idle. Click a button to test."}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-medium">View sample payloads</summary>
        <pre className="mt-2 rounded bg-slate-100 p-3 text-xs overflow-x-auto">
          {JSON.stringify({ generalPayload, institutionalPayload }, null, 2)}
        </pre>
      </details>
    </div>
  );
}

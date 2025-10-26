"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import axios from "axios";
import authRepository from "@/repositories/authRepository";

const DISTRICT = "Dhading";
const PALIKA = "Gajuri Gaunpalika";

export default function UnifiedSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 fields
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);

  // Step 2 fields
  const [accountType, setAccountType] = useState("general");
  const [dob, setDob] = useState("");
  const [ward, setWard] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState("");

  // Step 3 (OTP) fields
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [resending, setResending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStep1Continue = (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email || !phoneNumber || !password || !agree) {
      setError("Please complete all fields and agree to terms.");
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!dob || !ward) {
      setError("Please complete all fields.");
      return;
    }

    if (accountType === "institutional" && !institutionCategory) {
      setError("Please select an institution category.");
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        username,
        email,
        password,
        phoneNumber,
        isInstitutionalUser: accountType === "institutional",
        dateOfBirth: dob,
        district: DISTRICT,
        palika: PALIKA,
        ward: Number(ward),
        institutionCategory:
          accountType === "institutional" ? institutionCategory : "",
      };

      console.log("Signup Request Data:", requestData);

      const res = await axios.post(
        "https://test.gajuri.com/api/auth/register",
        requestData
      );

      console.log("Signup Response:", res.data);

      if (res?.data?.data?.token) {
        setToken(res.data.data.token);
        console.log("Storing Token:", res.data.data.token);
        sessionStorage.setItem("token", JSON.stringify(res.data.data.token));
      }
      sessionStorage.setItem("signup:data", JSON.stringify(requestData));

      // Move to OTP step
      setCurrentStep(3);
    } catch (err) {
      console.error("❌ Signup failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value) => {
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await authRepository.otpVerification({
        email,
        otp,
        token,
      });
      console.log("OTP Verification Response:", response);
      router.push("/signup/success");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtp("");
    setError("");

    try {
      const savedData = sessionStorage.getItem("signup:data");

      if (!savedData) {
        setError("Session expired. Please sign up again.");
        setCurrentStep(1);
        return;
      }

      const requestData = JSON.parse(savedData);
      console.log("Resending OTP with data:", requestData);

      const res = await axios.post(
        "https://test.gajuri.com/api/auth/register",
        requestData
      );

      console.log("Resend OTP Response:", res.data.data.token);

      if (res?.data?.data?.token) {
        setToken(res.data.data.token);
        sessionStorage.setItem("token", JSON.stringify(res.data.data.token));
      }

      setError("");
      alert("OTP has been resent to your email!");
    } catch (err) {
      console.error("❌ Resend OTP failed:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep === 1
                  ? "bg-[#1B74E4]"
                  : currentStep > 1
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep === 2
                  ? "bg-[#1B74E4]"
                  : currentStep > 2
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            />
            <div
              className={`h-2 w-2 rounded-full ${
                currentStep === 3 ? "bg-[#1B74E4]" : "bg-gray-300"
              }`}
            />
          </div>
          <p className="text-center text-sm text-gray-500">
            Step {currentStep} of 3
          </p>
        </div>

        {/* Step 1 */}
        {currentStep === 1 && (
          <>
            <h1 className="text-center text-[22px] font-semibold text-gray-800">
              Discover your neighborhood
            </h1>

            <form onSubmit={handleStep1Continue} className="mt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone number
                </label>
                <input
                  type="tel"
                  placeholder="+97798xxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 pr-11 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 my-auto grid h-8 w-8 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  By continuing with sign up, you agree to our{" "}
                  <Link href="#" className="underline">
                    Privacy Policy
                  </Link>
                  ,{" "}
                  <Link href="#" className="underline">
                    Cookie Policy
                  </Link>
                  , and{" "}
                  <Link href="#" className="underline">
                    Member Agreement
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="mt-1 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Continue
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-700">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium underline hover:text-gray-900"
              >
                Log in
              </Link>
            </p>
          </>
        )}

        {/* Step 2 and Step 3 remain same */}
      </div>
    </div>
  );
}

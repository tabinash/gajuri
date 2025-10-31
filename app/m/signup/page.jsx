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
      router.push("/m/signup/success");
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
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 1
                ? "bg-blue-600"
                : currentStep > 1
                ? "bg-green-500"
                : "bg-slate-300"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 2
                ? "bg-blue-600"
                : currentStep > 2
                ? "bg-green-500"
                : "bg-slate-300"
            }`}
          />
          <div
            className={`h-2 w-2 rounded-full ${
              currentStep === 3 ? "bg-blue-600" : "bg-slate-300"
            }`}
          />
        </div>
        <p className="text-center text-sm text-slate-600">
          Step {currentStep} of 3
        </p>
      </div>

      {/* Step 1 */}
      {currentStep === 1 && (
        <>
          <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-center text-sm text-slate-600 mb-8">
            Join Gajuri community
          </p>

          <form onSubmit={handleStep1Continue} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone number
              </label>
              <input
                type="tel"
                placeholder="+977 98xxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 my-auto grid h-10 w-10 place-items-center rounded-md text-slate-500 active:bg-slate-100"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4"
              />
              <span>
                By continuing, you agree to our{" "}
                <Link href="#" className="font-medium text-blue-600">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="#" className="font-medium text-blue-600">
                  Terms of Service
                </Link>
                .
              </span>
            </label>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600 text-center" role="alert">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!agree}
              className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/m/login"
                className="font-semibold text-blue-600 active:text-blue-700"
              >
                Log in
              </Link>
            </p>
          </div>
        </>
      )}

      {/* Step 2 */}
      {currentStep === 2 && (
        <>
          <button
            onClick={() => setCurrentStep(1)}
            className="mb-6 inline-flex items-center gap-2 text-slate-700 active:text-slate-900"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
            Tell us about yourself
          </h1>
          <p className="text-center text-sm text-slate-600 mb-8">
            Help us personalize your experience
          </p>

          <form onSubmit={handleStep2Submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Account Type
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("general")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                    accountType === "general"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-300 bg-white text-slate-700 active:bg-slate-50"
                  }`}
                >
                  General User
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("institutional")}
                  className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition ${
                    accountType === "institutional"
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-slate-300 bg-white text-slate-700 active:bg-slate-50"
                  }`}
                >
                  Institution
                </button>
              </div>
            </div>

            {accountType === "institutional" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Institution Category
                </label>
                <select
                  value={institutionCategory}
                  onChange={(e) => setInstitutionCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select category</option>
                  <option value="Government">Government</option>
                  <option value="School">School</option>
                  <option value="Hospital">Hospital</option>
                  <option value="NGO">NGO</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ward Number
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select ward</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((w) => (
                  <option key={w} value={w}>
                    Ward {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-medium">📍 {PALIKA}, {DISTRICT}</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600 text-center" role="alert">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Continue"}
            </button>
          </form>
        </>
      )}

      {/* Step 3 - OTP Verification */}
      {currentStep === 3 && (
        <>
          <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
            Verify your email
          </h1>
          <p className="text-center text-sm text-slate-600 mb-8">
            We've sent a 4-digit code to{" "}
            <span className="font-semibold text-slate-900">{email}</span>
          </p>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                Enter verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="••••"
                className="w-full rounded-lg border-2 border-slate-300 bg-white px-4 py-4 text-center text-3xl tracking-[0.5em] font-semibold text-slate-900 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600 text-center" role="alert">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-sm font-medium text-slate-600 active:text-slate-900 disabled:opacity-50"
              >
                {resending ? "Resending..." : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

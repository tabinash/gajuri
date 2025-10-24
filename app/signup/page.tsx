"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import axios from "axios";
import authRepository from "@/repositories/authRepository";

type AccountType = "general" | "institutional";

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
  const [accountType, setAccountType] = useState<AccountType>("general");
  const [dob, setDob] = useState("");
  const [ward, setWard] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState("");

  // Step 3 (OTP) fields
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [resending, setResending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !email || !phoneNumber || !password || !agree) {
      setError("Please complete all fields and agree to terms.");
      return;
    }

    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
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
        institutionCategory: accountType === "institutional" ? institutionCategory : "",
      };

      console.log("Signup Request Data:", requestData);

      const res = await axios.post("https://test.gajuri.com/api/auth/register", requestData);
      
      console.log("Signup Response:", res.data);
      
      if (res?.data?.data?.token) {
        setToken(res.data.data.token);
        console.log("Storing Token:", res.data.data.token);
        sessionStorage.setItem("token", JSON.stringify(res.data.data.token));
      }
      sessionStorage.setItem("signup:data", JSON.stringify(requestData));
      
      // Move to OTP step
      setCurrentStep(3);

    } catch (err: any) {
      console.error("❌ Signup failed:", err);
      setError(err?.response?.data?.message || err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setOtp(value);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Verification failed");
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

      const res = await axios.post("https://test.gajuri.com/api/auth/register", requestData);
      
      console.log("Resend OTP Response:", res.data.data.token);
      
      if (res?.data?.data?.token) {
        setToken(res.data.data.token);
        sessionStorage.setItem("token", JSON.stringify(res.data.data.token));
      }

      setError("");
      alert("OTP has been resent to your email!");
      
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
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`h-2 w-2 rounded-full ${currentStep === 1 ? 'bg-[#1B74E4]' : currentStep > 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${currentStep === 2 ? 'bg-[#1B74E4]' : currentStep > 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
            <div className={`h-2 w-2 rounded-full ${currentStep === 3 ? 'bg-[#1B74E4]' : 'bg-gray-300'}`} />
          </div>
          <p className="text-center text-sm text-gray-500">Step {currentStep} of 3</p>
        </div>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <>
            <h1 className="text-center text-[22px] font-semibold text-gray-800">
              Discover your neighborhood
            </h1>

            <form onSubmit={handleStep1Continue} className="mt-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <input
                  type="tel"
                  placeholder="+97798xxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
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
                  <Link href="#" className="underline">Privacy Policy</Link>,{" "}
                  <Link href="#" className="underline">Cookie Policy</Link>, and{" "}
                  <Link href="#" className="underline">Member Agreement</Link>.
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
              <Link href="/login" className="font-medium underline hover:text-gray-900">
                Log in
              </Link>
            </p>
          </>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <>
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <h1 className="text-center text-[22px] font-semibold text-gray-800">
              A few more details
            </h1>

            <form onSubmit={handleStep2Submit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Account type</label>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setAccountType("general")}
                    disabled={loading}
                    className={`rounded-full px-4 py-2 text-sm border transition ${
                      accountType === "general"
                        ? "border-[#1B74E4] bg-[#1B74E4] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    General
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType("institutional")}
                    disabled={loading}
                    className={`rounded-full px-4 py-2 text-sm border transition ${
                      accountType === "institutional"
                        ? "border-[#1B74E4] bg-[#1B74E4] text-white"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Institutional
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">District</label>
                  <input
                    type="text"
                    value={DISTRICT}
                    readOnly
                    className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] text-gray-900 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Palika</label>
                  <input
                    type="text"
                    value={PALIKA}
                    readOnly
                    className="w-full rounded-[10px] border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-[15px] text-gray-900 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ward</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="e.g., 10"
                  disabled={loading}
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                />
              </div>

              {accountType === "institutional" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution category</label>
                  <select
                    value={institutionCategory}
                    onChange={(e) => setInstitutionCategory(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-[10px] border border-gray-200 bg-white px-3.5 py-2.5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  >
                    <option value="">Select category</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Hospital">Hospital</option>
                    <option value="NGO">NGO</option>
                    <option value="Government">Government</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending code..." : "Continue"}
              </button>
            </form>
          </>
        )}

        {/* Step 3: OTP Verification */}
        {currentStep === 3 && (
          <>
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <h1 className="text-center text-[22px] font-semibold text-gray-800">
              Verify your email
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a 4-digit OTP to {email || "your email"}.
            </p>

            <form onSubmit={handleOtpSubmit} className="mt-6 space-y-5">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="w-full rounded-[10px] border border-gray-200 bg-white px-4 py-3 text-center text-2xl tracking-widest text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1B74E4]/40"
                />
              </div>

              {error && (
                <p className="text-center text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="mt-4 w-full text-sm text-gray-700 underline hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
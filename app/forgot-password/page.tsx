"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step management
  const [step, setStep] = useState(1); // 1: Email, 2: New Password, 3: Success
  
  // Form fields
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call API to send reset token to email
      const response = await axios.post("https://test.gajuri.com/api/auth/forgot-password", {
        email
      });
      console.log("✅ Reset token sent:", response.data);
      
      // Store the token from response
      if (response.data.token) {
        setToken(response.data.token);
      }
      
      // Move to step 2
      setStep(2);
    } catch (err: any) {
      console.error("❌ Request reset failed:", err);
      setError(err?.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call API with email, token, newPassword, and otp
      const response = await axios.post("https://test.gajuri.com/api/auth/reset-password", {
        email,
        token,
        newPassword,
        otp
      });
      
      console.log("✅ Password reset successful:", response.data);
      
      // Move to success step
      setStep(3);
    } catch (err: any) {
      console.error("❌ Password reset failed:", err);
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Centered column */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center p-4 sm:p-6">
        <div className="w-full">
          {/* Card */}
          <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-2xl sm:p-8">
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <>
                <h1 className="text-center text-[22px] font-semibold text-gray-800">
                  Reset your password
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your email address and we'll send you a reset code
                </p>

                <form onSubmit={handleRequestReset} className="mt-6 space-y-3">
                  <label className="block">
                    <span className="sr-only">Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      autoComplete="email"
                      required
                      className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    />
                  </label>

                  {error && (
                    <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!email.trim() || loading}
                    className="mt-2 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending..." : "Send reset code"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-700 underline hover:text-gray-900">
                    <ArrowLeft size={14} />
                    Back to sign in
                  </Link>
                </div>
              </>
            )}

            {/* Step 2: Enter Token and New Password */}
            {step === 2 && (
              <>
                <h1 className="text-center text-[22px] font-semibold text-gray-800">
                  Create new password
                </h1>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Check your email for an OTP code and enter your new password
                </p>

                <form onSubmit={handleResetPassword} className="mt-6 space-y-3">
                  <label className="block">
                    <span className="sr-only">OTP Code</span>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP code from email"
                      required
                      className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                    />
                  </label>

                  <div className="relative">
                    <label className="block">
                      <span className="sr-only">New Password</span>
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={showPw ? "Hide password" : "Show password"}
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block">
                      <span className="sr-only">Confirm Password</span>
                      <input
                        type={showConfirmPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        required
                        className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                      />
                    </label>
                    <button
                      type="button"
                      aria-label={showConfirmPw ? "Hide password" : "Show password"}
                      onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
                    >
                      {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={!otp.trim() || !newPassword.trim() || !confirmPassword.trim() || loading}
                    className="mt-2 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-sm text-gray-700 underline hover:text-gray-900"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-[22px] font-semibold text-gray-800">
                    Password reset successful!
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/login")}
                  className="mt-6 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9]"
                >
                  Go to sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
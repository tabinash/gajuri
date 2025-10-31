"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authRepository } from "@/repositories/authRepository";
import { getUserProfile } from "@/repositories/UserRepository";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const credentials = { email, password: pw };

      // ✅ Call the actual login API
      const response = await authRepository.login(credentials);
      console.log("✅ Login success:", response.data);

      const userProfile = await getUserProfile(email);
      console.log("✅ Fetched user profile:", userProfile);

      if (userProfile.data.profilePhotoUrl) {
        router.replace(from || "/feed");
      } else {
        router.replace("/complete-profile");
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      setError(
        err?.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Card */}
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-2xl sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          Sign in to your account
        </h1>

        <form onSubmit={onSignIn} className="mt-6 space-y-3">
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

          <div className="relative">
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
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

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/forgot-password"
              className="text-sm text-gray-700 underline hover:text-gray-900"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !pw.trim() || loading}
            className="mt-2 w-full rounded-full bg-[#1B74E4] px-6 py-3 text-[15px] font-medium text-white transition hover:bg-[#1B74E9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium underline hover:text-gray-900"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Page() {
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
        <Suspense
          fallback={
            <div className="w-full">
              <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-2xl sm:p-8 animate-pulse">
                <div className="h-7 w-48 mx-auto rounded bg-gray-200" />
                
                <div className="mt-6 space-y-3">
                  <div className="h-12 rounded-[12px] bg-gray-200" />
                  <div className="h-12 rounded-[12px] bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-12 rounded-full bg-gray-200 mt-2" />
                </div>

                <div className="mt-4 h-4 w-56 mx-auto rounded bg-gray-200" />
              </div>
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
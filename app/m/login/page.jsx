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

      if ( userProfile.data.profilePhotoUrl) {
        router.replace(from || "/m/feed");
      } else {
        router.replace("/m/complete-profile");
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
      <h1 className="text-center text-2xl font-bold text-slate-900 mb-2">
        Welcome Back
      </h1>
      <p className="text-center text-sm text-slate-600 mb-8">
        Sign in to continue to Gajuri
      </p>

      <form onSubmit={onSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-3 my-auto grid h-10 w-10 place-items-center rounded-md text-slate-500 active:bg-slate-100"
            >
              {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Link
            href="/m/forgot-password"
            className="text-sm font-medium text-blue-600 active:text-blue-700"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={!email.trim() || !pw.trim() || loading}
          className="w-full rounded-lg bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            href="/m/signup"
            className="font-semibold text-blue-600 active:text-blue-700"
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
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-md px-6 py-8">
        <Suspense
          fallback={
            <div className="w-full animate-pulse">
              <div className="h-8 w-48 mx-auto rounded bg-slate-200 mb-2" />
              <div className="h-4 w-56 mx-auto rounded bg-slate-200 mb-8" />

              <div className="space-y-4">
                <div>
                  <div className="h-4 w-16 rounded bg-slate-200 mb-2" />
                  <div className="h-12 rounded-lg bg-slate-200" />
                </div>
                <div>
                  <div className="h-4 w-20 rounded bg-slate-200 mb-2" />
                  <div className="h-12 rounded-lg bg-slate-200" />
                </div>
                <div className="h-4 w-32 rounded bg-slate-200 ml-auto" />
                <div className="h-12 rounded-lg bg-slate-200" />
              </div>

              <div className="mt-6 h-4 w-56 mx-auto rounded bg-slate-200" />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => {
    const emailOk = /.+@.+\..+/.test(email);
    return name.trim().length >= 2 && emailOk && password.length >= 6 && agree;
  }, [name, email, password, agree]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canContinue) {
      setError("Please complete all fields correctly.");
      return;
    }
    // Persist minimal info for the OTP step
    if (typeof window !== "undefined") {
      sessionStorage.setItem(
        "signup:data",
        JSON.stringify({ name, email, password })
      );
    }
  router.push("/signup/details");
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          Discover your neighborhood
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
          />

          <div className="relative">
            <input
              type={show ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
            <button
              type="button"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((v) => !v)}
              className="absolute inset-y-0 right-2 my-auto grid h-9 w-9 place-items-center rounded-md text-gray-500 hover:bg-gray-100"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span>
              By continuing with sign up, you agree to our {""}
              <Link href="#" className="underline">Privacy Policy</Link>, {""}
              <Link href="#" className="underline">Cookie Policy</Link>, and {""}
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
            disabled={!canContinue}
            className="mt-1 w-full rounded-full bg-green-600 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-700">
          Already have an account? {""}
          <Link href="/login" className="font-medium underline hover:text-gray-900">
            Log in
          </Link>
        </p>
      </div>

      <button
        type="button"
        className="mx-auto mt-4 block w-full max-w-[520px] rounded-full bg-white px-6 py-3 text-gray-800 shadow hover:bg-gray-50 transition"
        onClick={() => router.push("/signup/otp")}
      >
        Have an invite code?
      </button>
    </div>
  );
}

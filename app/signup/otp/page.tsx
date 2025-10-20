"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const DIGITS = 6;

export default function OtpPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(DIGITS).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("signup:data");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setEmail(parsed.email ?? "");
        } catch {}
      }
    }
  }, []);

  const value = useMemo(() => code.join(""), [code]);
  const canVerify = value.length === DIGITS;

  function onChange(index: number, v: string) {
    if (!/^[0-9]?$/.test(v)) return;
    const arr = [...code];
    arr[index] = v;
    setCode(arr);
    if (v && inputs.current[index + 1]) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && inputs.current[index - 1]) {
      e.preventDefault();
      const arr = [...code];
      arr[index - 1] = "";
      setCode(arr);
      inputs.current[index - 1]?.focus();
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Mock verification: accept 000000 or any 6 digits
    await new Promise((r) => setTimeout(r, 600));
    if (!canVerify) {
      setError("Enter the 6-digit code.");
      return;
    }
    router.push("/signup/success");
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          Verify your email
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit code to {email || "your email"}.
        </p>

        <form onSubmit={verify} className="mt-6 space-y-5">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {Array.from({ length: DIGITS }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={code[i]}
                onChange={(e) => onChange(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                className="h-12 w-10 rounded-lg border border-gray-300 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-green-600/20 sm:h-14 sm:w-12"
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canVerify}
            className="mx-auto block w-full rounded-full bg-green-600 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Verify
          </button>
        </form>

        <button
          type="button"
          className="mt-4 w-full text-sm text-gray-700 underline"
          onClick={() => {
            setCode(Array(DIGITS).fill(""));
            inputs.current[0]?.focus();
          }}
        >
          Resend code
        </button>
      </div>
    </div>
  );
}

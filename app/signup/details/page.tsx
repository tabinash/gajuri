"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AccountType = "general" | "institutional";

export default function DetailsStepPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("general");
  const [dob, setDob] = useState("");
  const [district, setDistrict] = useState("");
  const [palika, setPalika] = useState("");
  const [ward, setWard] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step1Exists, setStep1Exists] = useState(false);

  useEffect(() => {
    // Ensure step 1 data exists
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("signup:data");
      setStep1Exists(!!raw);
      if (!raw) {
        router.replace("/signup");
      }
    }
  }, [router]);

  const canContinue = useMemo(() => {
    const wardOk = ward === "" ? false : /^\d{1,2}$/.test(ward);
    return (
      (accountType === "general" || accountType === "institutional") &&
      dob.length > 0 &&
      district.trim().length > 0 &&
      palika.trim().length > 0 &&
      wardOk
    );
  }, [accountType, dob, district, palika, ward]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!canContinue) {
      setError("Please complete all fields correctly.");
      return;
    }
    try {
      setLoading(true);
      const raw = sessionStorage.getItem("signup:data");
      const base = raw ? JSON.parse(raw) : {};
      const payload = {
        ...base,
        accountType,
        dob,
        district,
        palika,
        ward: Number(ward),
      };
      sessionStorage.setItem("signup:data", JSON.stringify(payload));

      // Call initiate API to send OTP
      const res = await fetch("/api/signup/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Failed to initiate signup");
      }

      router.push("/signup/otp");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!step1Exists) return null;

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          A few more details
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-800">Account type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAccountType("general")}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  accountType === "general"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setAccountType("institutional")}
                className={`rounded-full px-4 py-2 text-sm border transition ${
                  accountType === "institutional"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Institutional
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-800">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-800">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g., Kathmandu"
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-800">Palika</label>
            <input
              type="text"
              value={palika}
              onChange={(e) => setPalika(e.target.value)}
              placeholder="e.g., Kirtipur"
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-800">Ward</label>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={99}
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g., 10"
              className="w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canContinue || loading}
            className="mt-2 w-full rounded-full bg-green-600 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending code..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

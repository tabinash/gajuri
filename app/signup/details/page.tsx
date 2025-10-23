"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type AccountType = "general" | "institutional";

const DISTRICT = "Dhading";
const PALIKA = "Gajuri Gaunpalika";

export default function DetailsStepPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("general");
  const [dob, setDob] = useState("");
  const [ward, setWard] = useState("");
  const [institutionCategory, setInstitutionCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const data = sessionStorage.getItem("signup:data");
    if (!data) router.replace("/signup");
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const savedData = JSON.parse(sessionStorage.getItem("signup:data") || "{}");
      
      const requestData = {
        ...savedData,
        isInstitutionalUser: accountType === "institutional",
        dateOfBirth: dob,
        district: DISTRICT,
        palika: PALIKA,
        ward: Number(ward),
        institutionCategory: accountType === "institutional" ? institutionCategory : "",
      };
      console.log("Signup Request Data:", requestData);

      // ✅ Direct API call using axios
      const res = await axios.post("https://test.gajuri.com/api/auth/register", requestData);
      
      console.log("Signup Response:", res.data);
      
      if (res?.data?.token) {
        sessionStorage.setItem("token", JSON.stringify(res.data.token));
      }
      sessionStorage.setItem("signup:data", JSON.stringify(requestData));
      
      if (res) {
        router.push("/signup/otp");
      }

    } catch (err: any) {
      console.error("❌ Signup failed:", err);
      setError(err?.response?.data?.message || err?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8">
        <h1 className="text-center text-[22px] font-semibold text-gray-800">
          A few more details
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <label className="text-sm font-medium text-gray-800">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-800">District</label>
              <input
                type="text"
                value={DISTRICT}
                readOnly
                className="mt-2 w-full rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-800">Palika</label>
              <input
                type="text"
                value={PALIKA}
                readOnly
                className="mt-2 w-full rounded-[12px] border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Ward</label>
            <input
              type="number"
              min={1}
              max={99}
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g., 10"
              disabled={loading}
              className="mt-2 w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            />
          </div>

          {accountType === "institutional" && (
            <div>
              <label className="text-sm font-medium text-gray-800">Institution category</label>
              <select
                value={institutionCategory}
                onChange={(e) => setInstitutionCategory(e.target.value)}
                disabled={loading}
                className="mt-2 w-full rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600/20"
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
      </div>
    </div>
  );
}
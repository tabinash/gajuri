"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function SuccessPage() {
  const [name, setName] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = sessionStorage.getItem("signup:data");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setName(parsed.name ?? "");
        } catch {}
      }
    }
  }, []);

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white shadow-2xl p-6 sm:p-8 text-center">
        <CheckCircle2 className="mx-auto text-green-600" size={56} />
        <h1 className="mt-3 text-[22px] font-semibold text-gray-800">
          You're all set{ name ? `, ${name.split(" ")[0]}` : "" }!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account has been created successfully.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/login"
            className="rounded-full bg-green-600 px-6 py-3 text-white text-[15px] font-medium hover:bg-green-700 text-center"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="rounded-full bg-gray-100 px-6 py-3 text-gray-800 text-[15px] font-medium hover:bg-gray-200 text-center"
          >
            Explore Home
          </Link>
        </div>
      </div>
    </div>
  );
}

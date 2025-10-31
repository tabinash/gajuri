// JobsLayout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Plus } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function JobsLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on a job detail page or new job page
  const isJobDetail = pathname.startsWith("/m/jobs/") &&
                      pathname !== "/m/jobs" &&
                      !pathname.includes("your-jobs");
  const isNewJob = pathname === "/m/jobs/new";

  // If job detail page or new job page, just render children without tabs/header
  if (isJobDetail || isNewJob) {
    return <>{children}</>;
  }

  const tabs = [
    { label: "All jobs", href: { pathname: "/m/jobs", query: { hide: "true" } } },
    { label: "Your jobs", href: { pathname: "/m/jobs/your-jobs", query: { hide: "true" } } },
  ];

  return (
    <section>
      {/* Tabs + Add Job - Mobile optimized */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/m/jobs" && pathname.startsWith(tab.href.pathname));
              return (
               <Link
  key={tab.label}
  href={tab.href}
  className={`pb-0.5 text-base font-semibold transition-colors ${
    isActive
      ? "border-b-2 border-blue-600 text-slate-900"
      : "text-slate-600 active:text-slate-800"
  }`}
  style={{
    fontFamily: "'Poppins', sans-serif", // 👈 directly embed custom font
  }}
>
  {tab.label}
</Link>

              );
            })}
          </div>

          <button
            onClick={() => router.push("/m/jobs/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white active:bg-blue-700 transition-colors shrink-0"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}
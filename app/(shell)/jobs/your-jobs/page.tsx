"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {  getJobByUserId } from "@/repositories/JobRepository";

type ApiJob = {
  id: number | string;
  title: string;
  description: string;
  category: string;
  jobType: string;
  salary: number;
  location: string;
  open: boolean;
  contactNo: string;
  createdAt: string;
  userId: number | string;
  username: string;
  profilePicture?: string;
};

type Job = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  salary?: string;
  posted: string;
  tags?: string[];
  originalData: ApiJob;
};

function relativeTimeFromISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [label: string, sec: number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [label, sec] of units) {
    const v = Math.floor(diffSec / sec);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function formatSalary(n?: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return undefined;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rs ${n}`;
  }
}

function normalizeJobType(v?: string): Job["type"] {
  const t = (v || "").toLowerCase().replace(/[_-]/g, " ");
  if (t.includes("full")) return "Full-time";
  if (t.includes("part")) return "Part-time";
  if (t.includes("intern")) return "Internship";
  if (t.includes("contract")) return "Contract";
  if (t.includes("remote")) return "Remote";
  return "Full-time";
}

function mapApiToJob(j: ApiJob): Job {
  return {
    id: String(j.id),
    title: j.title || "Untitled role",
    company: j.username || "Unknown",
    logo: j.profilePicture,
    location: j.location || "—",
    type: normalizeJobType(j.jobType),
    salary: formatSalary(j.salary),
    posted: relativeTimeFromISO(j.createdAt),
    tags: j.category ? [j.category] : [],
    originalData: j,
  };
}

function Logo({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/80/EEE/94A3B8?text=Logo";
        }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
      {initials}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const { id, title, company, logo, location, type, salary, tags, originalData } = job;

  const handleSelect = () => {
    try {
      localStorage.setItem("selectedJob-abinash", JSON.stringify(originalData));
    } catch (err) {
      console.error("Failed to save job to localStorage:", err);
    }
  };

  return (
    <Link
      href={{ pathname: `/jobs/${id}`, query: { hide: "true" } }}
      onClick={handleSelect}
      className="block rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Logo src={logo} name={company} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-slate-900">
              {title}
            </div>
            <div className="truncate text-sm text-slate-600">{company}</div>
            <div className="mt-1 text-[12px] text-slate-500">
              {location}
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
            {type}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {salary && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              {salary}
            </span>
          )}
          {tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export default function UserJobs() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
  
  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getJobByUserId(userData?.id);
        console.log("Fetched jobs:", res.data);
        const rows: ApiJob[] = Array.isArray((res as any)?.data)
          ? (res as any).data
          : Array.isArray(res)
          ? (res as any)
          : [];
        const mapped = rows.map(mapApiToJob);
        if (!ignore) setItems(mapped);
      } catch (err: any) {
        if (!ignore) setError(err?.message || "Failed to load jobs");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      {loading && <div className="text-sm text-slate-600">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-sm text-slate-500">No jobs found.</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </section>
  );
}

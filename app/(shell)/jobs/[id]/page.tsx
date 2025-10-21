"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, MoreHorizontal, Send, MapPin, Building2, Briefcase, Phone } from "lucide-react";

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
  type: string;
  salary?: string;
  posted: string;
  description: string;
  category?: string;
  open?: boolean;
  contactNo?: string;
  userId?: string | number;
};

function relativeTimeFromISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [string, number][] = [
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

function normalizeType(v?: string) {
  const t = (v || "").toLowerCase().replace(/[_-]/g, " ");
  if (t.includes("full")) return "Full-time";
  if (t.includes("part")) return "Part-time";
  if (t.includes("intern")) return "Internship";
  if (t.includes("contract")) return "Contract";
  if (t.includes("remote")) return "Remote";
  return v || "Full-time";
}

function fromApi(j: ApiJob): Job {
  return {
    id: String(j.id),
    title: j.title || "Untitled role",
    company: j.username || "Unknown",
    logo: j.profilePicture,
    location: j.location || "—",
    type: normalizeType(j.jobType),
    salary: formatSalary(j.salary),
    posted: relativeTimeFromISO(j.createdAt),
    description: j.description || "",
    category: j.category || undefined,
    open: typeof j.open === "boolean" ? j.open : undefined,
    contactNo: j.contactNo || undefined,
    userId: j.userId,
  };
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const json = localStorage.getItem("selectedJob-abinash");
      if (json) {
        const apiJob: ApiJob = JSON.parse(json);
        // Verify the ID matches
        if (String(apiJob.id) === params.id) {
          setJob(fromApi(apiJob));
        } else {
          console.warn("Job ID mismatch. Stored job ID does not match URL parameter.");
          setJob(null);
        }
      } else {
        setJob(null);
      }
    } catch (err) {
      console.error("Failed to load job from localStorage:", err);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading job details...
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-600">
            No job found. Please select a job from the{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              Jobs page
            </Link>
            .
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-12 gap-4 p-8">
      {/* Left: details */}
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-6 text-slate-900">
                {job.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Building2 size={14} /> {job.company}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin size={14} /> {job.location}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={14} /> {job.type}
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-600">{job.posted}</div>
            </div>
            <div className="flex items-center gap-2">
              {job.open !== undefined && (
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    job.open
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {job.open ? "Open" : "Closed"}
                </span>
              )}
             
            </div>
          </div>

          {job.salary && (
            <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
              {job.salary}
            </div>
          )}

          {/* Extra chips from API */}
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {job.category && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                {job.category}
              </span>
            )}
            {job.contactNo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-slate-700">
                <Phone size={12} />
                {job.contactNo}
              </span>
            )}
          </div>

          <div className="mt-4 whitespace-pre-line text-[15px] leading-6 text-slate-800">
            {job.description}
          </div>
        </div>
      </div>

      {/* Right: company + contact/apply */}
      <div className="col-span-12 space-y-4 lg:col-span-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <CompanyLogo src={job.logo} name={job.company} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                {job.company}
              </div>
              <div className="truncate text-xs text-slate-600">
                {job.location}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            
            <Link
              href={`/messages?userId=${job.userId}`}
              className="inline-flex flex-1 bg-blue-500 items-center justify-center gap-2 rounded-full   px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
            >
              <Send size={16} /> Message
            </Link>
          </div>
        </div>

        

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold text-slate-900">
            About the employer
          </div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              <span>{job.location}</span>
            </div>
            {job.contactNo && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <a href={`tel:${job.contactNo}`} className="text-blue-600 hover:underline">
                  {job.contactNo}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyLogo({ src, name }: { src?: string; name: string }) {
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
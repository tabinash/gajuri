"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getJobById } from "@/repositories/JobRepository";
import { relativeTimeFromISO, formatSalary, normalizeJobType } from "@/utils";

function mapApiToJob(j) {
  return {
    id: String(j.id),
    title: j.title || "Untitled role",
    company: j.username || "Unknown",
    logo: j.profilePicture,
    location: j.location || "—",
    type: normalizeJobType(j.jobType),
    salary: formatSalary(j.salary),
    posted: relativeTimeFromISO(j.createdAt),
    description: j.description || "",
    category: j.category,
    open: j.open,
    originalData: j,
  };
}

function Logo({ src, name }) {
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

function JobListItem({ job }) {
  const {
    id,
    title,
    company,
    logo,
    location,
    type,
    salary,
    posted,
    open,
    description,
    originalData,
  } = job;

  const handleSelect = () => {
    try {
      localStorage.setItem("selectedJob", JSON.stringify(originalData));
    } catch (err) {
      console.error("Failed to save job to localStorage:", err);
    }
  };

  return (
    <Link
      href={`/jobs/${id}?hide=true`}
      onClick={handleSelect}
      className="block border-b border-slate-200 bg-white transition-colors hover:bg-slate-50"
    >
      <div className="px-4 py-4">
        <div className="flex items-start gap-4">
          <Logo src={logo} name={company} />
          <div className="min-w-0 flex-1">
            {/* Title */}
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {title}
            </h3>

            {/* Company + Posted */}
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
              <span>{company}</span>
              <span>• {posted}</span>
              {!open && (
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-700">
                  Closed
                </span>
              )}
            </div>

            {/* Description */}
            <p className="mt-2 text-sm text-slate-700 leading-snug line-clamp-3">
              {description.slice(0, 180)}...
              <Link
                href={`/jobs/${id}?hide=true`}
                onClick={handleSelect}
                className="ml-1 text-blue-600 font-medium hover:underline text-xs"
              >
                See more
              </Link>
            </p>

            {/* Info line */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              {type && <span>{type}</span>}
              {salary && <span>• {salary}</span>}
              {location && (
                <span className="flex items-center gap-1">
                  • <MapPin size={12} />
                  {location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function JobListSkeleton() {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-4 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getJobById();
        const rows = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const mapped = rows.map(mapApiToJob);
        if (!ignore) setItems(mapped);
      } catch (err) {
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
    <section>
      {loading && (
        <div>
          {[1, 2, 3, 4].map((i) => (
            <JobListSkeleton key={i} />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-6 text-center text-xs text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">No jobs found</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div>
          {items.map((j) => (
            <JobListItem key={j.id} job={j} />
          ))}
        </div>
      )}
    </section>
  );
}

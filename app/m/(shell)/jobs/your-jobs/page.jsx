"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { getJobByUserId } from "@/repositories/JobRepository";
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
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
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
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-base font-semibold text-white">
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
      href={`/m/jobs/${id}`}
      onClick={handleSelect}
      className="block bg-white active:bg-slate-50 transition-colors border-b border-slate-200"
    >
      <div className="px-1 py-3">
        <div className="flex items-start gap-3">
          {/* <Logo src={logo} name={company} /> */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-gray-700 line-clamp-1">
              {title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-600">{description.slice(0,100)}.... 
              <Link  href={`/m/jobs/${id}`}
      onClick={handleSelect} className="text-blue-600 font-medium inline-flex items-center gap-1">
              see more</Link>
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              {type && (
                <span className="flex items-center gap-1">
                  {type}
                </span>
              )}
              {salary && <span>• {salary}</span>}
              {location && (
                <span className="flex items-center gap-1">
                  • <MapPin size={11} />
                  {location}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-slate-400">{posted}</div>
            {!open && (
              <span className="mt-1 inline-block text-xs font-medium text-slate-500">
                Closed
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function JobListSkeleton() {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
        <div className="h-3 w-12 rounded bg-slate-200" />
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
        const res = await getJobByUserId();
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
      {/* Loading State */}
      {loading && (
        <div>
          {[1, 2, 3, 4, 5].map((i) => (
            <JobListSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && items.length === 0 && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">No jobs found</p>
        </div>
      )}

      {/* Jobs List */}
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

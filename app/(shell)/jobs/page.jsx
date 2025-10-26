"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Briefcase, DollarSign, Clock, ArrowRight } from "lucide-react";
import { getAllJobs } from "@/repositories/JobRepository";

const TYPES = [
  "All types",
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
];

function relativeTimeFromISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units = [
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

function formatSalary(n) {
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

function normalizeJobType(v) {
  const t = (v || "").toLowerCase().replace(/[_-]/g, " ");
  if (t.includes("full")) return "Full-time";
  if (t.includes("part")) return "Part-time";
  if (t.includes("intern")) return "Internship";
  if (t.includes("contract")) return "Contract";
  if (t.includes("remote")) return "Remote";
  return "Full-time";
}

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

function JobFeedCard({ job }) {
  const { id, title, company, logo, location, type, salary, posted, description, category, open, originalData } = job;
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = description.length > 180;
  const displayDescription = expanded || !shouldTruncate ? description : description.slice(0, 180) + "...";

  const handleSelect = () => {
    try {
      localStorage.setItem("selectedJob-abinash", JSON.stringify(originalData));
    } catch (err) {
      console.error("Failed to save job to localStorage:", err);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Logo src={logo} name={company} />
          <div className="min-w-0 flex-1">
            <Link
              href={{ pathname: `/jobs/${id}`, query: { hide: "true" } }}
              onClick={handleSelect}
              className="group"
            >
              <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
            <p className="mt-0.5 text-sm text-slate-600">{company}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {posted}
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          {!open && (
            <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              Closed
            </span>
          )}
        </div>

        {/* Job Meta Info */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <Briefcase size={12} />
            {type}
          </span>
          {salary && (
            <span className="inline-flex items-center gap-1 rounded-md  px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100">
              <DollarSign size={12} />
              {salary}
            </span>
          )}
          {category && (
            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              {category}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <div className="mt-3">
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
              {displayDescription}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Action */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
          <Link
            href={{ pathname: `/jobs/${id}`, query: { hide: "true" } }}
            onClick={handleSelect}
            className="group inline-flex items-center gap-1.5 rounded-lg bg-[#1B74E4] px-4 py-2 text-sm font-medium text-white hover:bg-[#1B74F6] transition-colors"
          >
            See Details
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function JobFeedSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="h-6 w-20 rounded-md bg-slate-200" />
        <div className="h-6 w-24 rounded-md bg-slate-200" />
        <div className="h-6 w-16 rounded-md bg-slate-200" />
      </div>

      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-3/4 rounded bg-slate-200" />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="h-8 w-28 rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [type, setType] = useState("All types");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllJobs();
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

  const filtered = useMemo(() => {
    let arr = items;
    if (type !== "All types") {
      arr = arr.filter((j) => j.type === type);
    }
    const t = q.trim().toLowerCase();
    if (t) {
      arr = arr.filter(
        (j) =>
          j.title.toLowerCase().includes(t) ||
          j.company.toLowerCase().includes(t) ||
          j.location.toLowerCase().includes(t) ||
          j.description.toLowerCase().includes(t)
      );
    }
    return arr;
  }, [items, type, q]);

  return (
    <div className="w-full max-w-3xl ">
      <section className="space-y-4 px-4 py-6">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3 p-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs..."
              className="flex-1 text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                type === t
                  ? "bg-[#1B74E4] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-black hover:border-[#1B74F4] hover:shadow-sm"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'job' : 'jobs'} found
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <JobFeedSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">No jobs found matching your criteria.</p>
            <button
              onClick={() => {
                setQ("");
                setType("All types");
              }}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Jobs Feed */}
        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((j) => (
              <JobFeedCard key={j.id} job={j} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
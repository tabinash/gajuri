"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, Briefcase } from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship" | "Remote";
  salary?: string; // "$80k–$110k"
  posted: string; // "2d ago"
  mine?: boolean;
  tags?: string[];
};

const TYPES = ["All types", "Full-time", "Part-time", "Contract", "Internship", "Remote"] as const;

const DATA: Job[] = [
  {
    id: "1",
    title: "Frontend Engineer (React/Next.js)",
    company: "Gajuri Labs",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop",
    location: "Kathmandu • Hybrid",
    type: "Full-time",
    salary: "$1,500–$2,200/mo",
    posted: "18 min ago",
    tags: ["React", "TypeScript", "Tailwind"],
  },
  {
    id: "2",
    title: "Customer Support Associate",
    company: "Hamro CSIT",
    logo: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop",
    location: "Remote",
    type: "Part-time",
    posted: "2h ago",
    tags: ["Support", "Email", "Chat"],
    mine: true,
  },
  {
    id: "3",
    title: "Backend Engineer (Node/Nest)",
    company: "Chitwan Medical",
    logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=200&auto=format&fit=crop",
    location: "Bharatpur • Onsite",
    type: "Contract",
    salary: "$2,000/mo",
    posted: "1d ago",
    tags: ["Node.js", "PostgreSQL", "REST"],
  },
  {
    id: "4",
    title: "Design Intern",
    company: "Forest Division",
    logo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    location: "Remote",
    type: "Internship",
    posted: "3d ago",
    tags: ["Figma", "UI", "Brand"],
  },
];

function JobCard({ job }: { job: Job }) {
  const { id, title, company, logo, location, type, salary, posted, tags } = job;
  return (
    <Link
      href={{ pathname: `/jobs/${id}`, query: { hide: "true" } }}
      className="block rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Logo src={logo} name={company} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-slate-900">{title}</div>
            <div className="truncate text-sm text-slate-600">{company}</div>
            <div className="mt-1 text-[12px] text-slate-500">
              {posted} • {location}
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
            <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {t}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function Logo({ src, name }: { src?: string; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200" />;
  }
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
      {initials}
    </div>
  );
}

export default function JobsPage() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [type, setType] = useState<(typeof TYPES)[number]>("All types");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    let arr = DATA;
    if (tab === "mine") arr = arr.filter((j) => j.mine);
    if (type !== "All types") arr = arr.filter((j) => j.type === type);
    const t = q.trim().toLowerCase();
    if (t) {
      arr = arr.filter(
        (j) =>
          j.title.toLowerCase().includes(t) ||
          j.company.toLowerCase().includes(t) ||
          j.location.toLowerCase().includes(t)
      );
    }
    return arr;
  }, [tab, type, q]);

  return (
    <section className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <button
              className={`-mb-px pb-3 text-sm ${tab === "all" ? "border-b-2 border-slate-900 font-semibold text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              onClick={() => setTab("all")}
            >
              All jobs
            </button>
            <button
              className={`-mb-px pb-3 text-sm ${tab === "mine" ? "border-b-2 border-slate-900 font-semibold text-slate-900" : "text-slate-600 hover:text-slate-800"}`}
              onClick={() => setTab("mine")}
            >
              Your jobs
            </button>
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95">
            <Briefcase size={16} />
            Post a job
          </button>
        </div>

        {/* Search + Type filter */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex w-full items-center rounded-full bg-[#F0F2F5] px-3 ring-1 ring-transparent focus-within:ring-[#E4E6EB] sm:max-w-md">
            <Search size={16} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title, company, or location"
              className="ml-2 h-9 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="relative w-48">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 shadow-sm focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              aria-label="Job type"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((j) => (
          <JobCard key={j.id} job={j} />
        ))}
      </div>
    </section>
  );
}
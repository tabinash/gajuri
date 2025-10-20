"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Bookmark, MoreHorizontal, Send, MapPin, Building2, Briefcase } from "lucide-react";

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
};

const MOCK: Record<string, Job> = {
  "1": {
    id: "1",
    title: "Frontend Engineer (React/Next.js)",
    company: "Gajuri Labs",
    logo: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=200&auto=format&fit=crop",
    location: "Kathmandu • Hybrid",
    type: "Full-time",
    salary: "$1,500–$2,200/mo",
    posted: "18 min ago",
    description:
      "We’re looking for a frontend engineer who loves crafting delightful, fast UIs. You’ll build new features with React, Next.js, and Tailwind, work closely with design, and help shape our component system.\n\nResponsibilities:\n• Ship accessible, responsive interfaces\n• Collaborate on design reviews and PRs\n• Write clean, testable code\n\nNice to have:\n• React Server Components\n• TanStack Query\n• Tailwind experience",
  },
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const job = useMemo(() => MOCK[params.id] ?? MOCK["1"], [params.id]);

  const [msg, setMsg] = useState("Hi, I’m interested in this role.");
  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    console.log("Message to employer:", msg.trim());
    setMsg("Hi, I’m interested in this role.");
  };

  return (
    <section className="grid grid-cols-12 gap-4 p-8">
      {/* Left: details */}
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold leading-6 text-slate-900">{job.title}</h1>
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
            <div className="flex items-center gap-1">
              <button aria-label="Save" className="rounded-full p-2 text-slate-600">
                <Bookmark size={18} />
              </button>
              <button aria-label="More" className="rounded-full p-2 text-slate-600">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          {job.salary && (
            <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
              {job.salary}
            </div>
          )}

          <div className="mt-4 whitespace-pre-line text-[15px] leading-6 text-slate-800">
            {job.description}
          </div>
        </div>
      </div>

      {/* Right: company + apply */}
      <div className="col-span-12 space-y-4 lg:col-span-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <CompanyLogo src={job.logo} name={job.company} />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">{job.company}</div>
              <div className="truncate text-xs text-slate-600">{job.location}</div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href="/jobs?apply=true"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:brightness-95"
            >
              Apply now
            </Link>
            <button className="rounded-full border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50">
              Save
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold text-slate-900">Message employer</div>
          <form onSubmit={send} className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 py-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Hi, I’m interested in this role."
            />
            <button
              type="submit"
              aria-label="Send"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-white"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function CompanyLogo({ src, name }: { src?: string; name: string }) {
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
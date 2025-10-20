"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2 } from "lucide-react";

type Org = {
  id: string;
  name: string;
  email: string;
  address: string;
  avatar?: string;
  verified?: boolean;
};

const ORGS: Org[] = [
  {
    id: "bharatpur-polic-booth",
    name: "Bharatpur Polic Booth",
    email: "police@gmail.com",
    address: "Bharatpur Metropolitan City, Ward No. 15, Kathmandu",
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "bahumukhi-dudh-sakhari",
    name: "Bahumukhi Dudh sakhari",
    email: "dairy@gmail.com",
    address: "Bharatpur Metropolitan City, Ward No. 15, Kathmandu",
    avatar:
      "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=200&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "kathmandu-polic-booth",
    name: "kathmandu Polic Booth",
    email: "ram@gmail.com",
    address: "Kathmandu Metropolitan City, Ward No. 15, Kathmandu",
    avatar:
      "https://images.unsplash.com/photo-1614020464123-90c8142fdcb7?q=80&w=200&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "forest-division-chitwan",
    name: "Forest Division Chitwan",
    email: "forest@gmail.com",
    address: "Bharatpur Metropolitan City, Ward No. 15, Chitwan",
    avatar:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=200&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "chitwan-medical-hospital",
    name: "Chitwan Medical Hospital",
    email: "medical@gmail.com",
    address: "Bharatpur Metropolitan City, Ward No. 15, Chitwan",
    avatar:
      "https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?q=80&w=200&auto=format&fit=crop",
    verified: true,
  },
];

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return ORGS;
    return ORGS.filter(
      (o) =>
        o.name.toLowerCase().includes(t) ||
        o.email.toLowerCase().includes(t) ||
        o.address.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search pill */}
      <div className="flex items-center rounded-full bg-[#F0F2F5] px-4 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search institutions..."
          className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      {/* Divider */}
      <hr className="my-4 border-slate-200" />

      {/* List */}
      <ul className="space-y-4">
        {items.map((o) => (
          <li
            key={o.id}
            className="rounded-2xl border border-[#E4E6EB] bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Avatar name={o.name} src={o.avatar} />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="truncate text-[15px] font-semibold text-slate-700 hover:underline"

                  >
                    {o.name}
                  </span>
                  {o.verified && (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-[#1B74E4]"
                      aria-label="Verified"
                    />
                  )}
                </div>

                <div className="truncate text-sm text-slate-600">{o.email}</div>
                <div className="truncate text-sm text-slate-600">{o.address}</div>
              </div>

              <Link
                href={`/explore/${o.id}`}
                className="shrink-0 rounded-full bg-[#1B74E4] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
              >
                Visit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
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
    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
      {initials}
    </div>
  );
}
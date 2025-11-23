"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, LucideSearch } from "lucide-react";
import { peopleRepository } from "@/repositories/peopleRepository";
import Link from "next/link";

function buildLocation(u) {
  const parts = [u.palika, u.district].filter(Boolean).join(", ");
  return u.ward ? (parts ? `${parts} — Ward ${u.ward}` : `Ward ${u.ward}`) : parts;
}

export default function PeoplePage() {
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
        const res = await peopleRepository.getPeopleData();
        const rows = Array.isArray(res?.data) ? res.data : [];
        if (!ignore) setItems(rows);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load data");
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
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((u) => {
      const loc = buildLocation(u) || "";
      return (
        u.username?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t) ||
        loc.toLowerCase().includes(t) ||
        u.district?.toLowerCase().includes(t) ||
        u.palika?.toLowerCase().includes(t) ||
        (u.ward && `ward ${u.ward}`.toLowerCase().includes(t))
      );
    });
  }, [q, items]);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Search */}
    {/* Search */}
<div className="sticky top-0 z-10 bg-white/95 pb-4 pt-3 backdrop-blur-sm">
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <LucideSearch
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search people by name, email, or location…"
        className="w-full rounded-full border border-slate-300 bg-white pl-11 pr-4 py-3
                   text-[15px] shadow-sm focus:outline-none focus:ring-2 
                   focus:ring-blue-500/30 focus:border-blue-500 transition-all"
      />
    </div>

    <button
      onClick={() => setQ(q)}
      className="rounded-full bg-blue-600 px-4 py-3 text-sm 
                 font-semibold text-white shadow-sm hover:bg-blue-700 
                 transition-colors"
    >
      Search
    </button>
  </div>
</div>


      {/* Simple Shimmer Loading */}
      {loading && (
        <ul className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <li
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                {/* Avatar shimmer */}
                <div className="h-12 w-12 rounded-full bg-slate-200 flex-shrink-0" />

                {/* Content shimmer */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-48 rounded bg-slate-200" />
                  <div className="h-3 w-40 rounded bg-slate-200" />
                </div>

                {/* Button shimmer */}
                <div className="h-9 w-16 rounded-full bg-slate-200 flex-shrink-0" />
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-white p-8">
          <div className="text-center text-red-600">
            <p className="font-semibold">Failed to load people</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12">
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium">
              {q.trim() ? "No results found" : "No people to show"}
            </p>
            <p className="text-sm mt-1">
              {q.trim() ? "Try searching with different keywords" : "Check back later!"}
            </p>
          </div>
        </div>
      )}

      {/* User List */}
      <ul className="space-y-3">
        {filtered.map((u) => {
          const location = buildLocation(u);
          const firstLetter = u.username?.charAt(0)?.toUpperCase() || "U";

          return (
            <li
              key={u.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                {u.profilePhotoUrl ? (
                  <img
                    src={u.profilePhotoUrl}
                    alt={`${u.username || "User"}'s avatar`}
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback alphabet circle */}
                {!u.profilePhotoUrl && (
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-base font-bold text-blue-700 flex-shrink-0">
                    {firstLetter}
                  </div>
                )}

                {/* If image fails, this hidden div becomes visible */}
                <div
                  className="h-12 w-12 hidden items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-base font-bold text-blue-700 flex-shrink-0"
                  style={{ display: "none" }}
                >
                  {firstLetter}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-[15px] font-semibold text-slate-900">
                      {u.username || "Unknown"}
                    </div>
                    {u.verified && (
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-green-600"
                        aria-label="Verified"
                      />
                    )}
                  </div>
{u.institutionCategory?(<div className="truncate text-sm text-slate-500">@{u.institutionCategory}</div>):(
                    <div> @general_user </div>
                  )}                  {location && (
                    <div className="truncate text-sm text-slate-500">{location}</div>
                  )}
                </div>

                {/* Visit button */}
                <Link
                  href={`/profile/?userId=${u.id}`}
                  className="shrink-0 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  Visit
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
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
    <div className="w-full">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-10 bg-white pb-2 pt-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people..."
          className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        />
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
              <div className="h-12 w-12 rounded-full bg-slate-200"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && <div className="text-center text-red-500 p-6">{error}</div>}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center text-slate-500 p-6">
          {q.trim() ? "No results found" : "No people yet"}
        </div>
      )}

      {/* User list */}
      <ul className="divide-y divide-slate-100">
        {filtered.map((u) => {
          const location = buildLocation(u);
          const firstLetter = u.username?.charAt(0)?.toUpperCase() || "U";

          return (
            <li key={u.id} className="hover:bg-slate-50 active:bg-slate-100 transition">
              <div className="flex items-center gap-3 p-3">
                {/* Avatar */}
                {u.profilePhotoUrl ? (
                  <img
                    src={u.profilePhotoUrl}
                    alt=""
                    className="h-12 w-12 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextSibling;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* fallback alphabet avatar */}
                {!u.profilePhotoUrl && (
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                    {firstLetter}
                  </div>
                )}

                {/* hidden fallback */}
                <div
                  className="h-12 w-12 hidden items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold"
                  style={{ display: "none" }}
                >
                  {firstLetter}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="truncate font-medium text-slate-900">
                      {u.username || "Unknown"}
                    </p>
                    {u.verified && (
                      <CheckCircle2 size={14} className="text-green-600 shrink-0" />
                    )}
                  </div>
                  {location && (
                    <p className="truncate text-sm text-slate-500">{location}</p>
                  )}
                  <p className="truncate text-xs text-slate-400">{u.email}</p>
                </div>

                {/* Visit button */}
                <Link
                  href={`/m/profile?userId=${u.id}`}
                  className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
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

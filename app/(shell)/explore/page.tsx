"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { exploreRepository } from "@/repositories/exploreRepository";
import Link from "next/link";

type ApiUser = {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  district?: string;
  palika?: string;
  ward?: string;
  verified?: boolean;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  createdAt?: string;
};

function buildLocation(u: Partial<ApiUser>) {
  const parts = [u.palika, u.district].filter(Boolean).join(", ");
  return u.ward ? (parts ? `${parts} — Ward ${u.ward}` : `Ward ${u.ward}`) : parts;
}

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await exploreRepository.getExploreData();
        const rows: ApiUser[] = Array.isArray(res?.data) ? res.data : [];
        if (!ignore) setItems(rows);
      } catch (e: any) {
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
      <div className="sticky top-0 z-10 bg-white/80 pb-3 pt-1 backdrop-blur">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or location…"
          className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600/20"
        />
      </div>

      {loading && <div className="py-6 text-sm text-slate-600">Loading…</div>}
      {error && <div className="py-6 text-sm text-red-600">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="py-6 text-sm text-slate-500">No results.</div>
      )}

      <ul className="space-y-3">
        {filtered.map((u) => {
          const location = buildLocation(u);
          const firstLetter = u.username?.charAt(0)?.toUpperCase() || "U";

          return (
            <li
              key={u.id}
              className="rounded-xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center gap-3">
                {u.profilePhotoUrl ? (
                  <img
                    src={u.profilePhotoUrl}
                    alt={`${u.username || "User"}'s avatar`}
                    className="h-12 w-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const fallback = e.currentTarget.nextSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                ) : null}

                {/* Fallback alphabet circle */}
                {!u.profilePhotoUrl && (
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                    {firstLetter}
                  </div>
                )}

                {/* If image fails, this hidden div becomes visible */}
                <div
                  className="h-12 w-12 hidden items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
                  style={{ display: "none" }}
                >
                  {firstLetter}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold text-slate-900">
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
                  <div className="truncate text-xs text-slate-600">{u.email}</div>
                  {location && (
                    <div className="truncate text-xs text-slate-600">{location}</div>
                  )}
                </div>

                {/* Visit button */}
                <Link
                  href={`/profile/?id=${u.id}`}
                  className="shrink-0 rounded-full bg-[#1B74E4] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95"
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

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function OtherProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Extract id to build tab hrefs consistently
  const match = pathname?.match(/^\/profile\/([^\/]+)/);
  const id = match?.[1] ?? "user";
  const base = `/profile/${id}`;
  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  // Mock: Derive a display name from the id (replace with real fetch later)
  const displayName = id
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
        {/* Cover */}
        <div className="relative h-40 w-full bg-gradient-to-r from-sky-500 to-indigo-500">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
            alt="Cover"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Avatar + meta */}
        <div className="px-6 pb-4">
          <div className="-mt-10 flex items-end gap-4">
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
              alt={`${displayName} avatar`}
              className="h-20 w-20 rounded-full border-4 border-white object-cover shadow"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-slate-900">{displayName}</h1>
              <p className="mt-0.5 text-sm text-slate-600">Neighbor • Willow Creek</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Message
              </button>
              <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:brightness-95">
                Follow
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex gap-6 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">86</span> followers
            </div>
            <div>
              <span className="font-semibold text-slate-900">12</span> posts
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-4 border-t border-slate-200">
            <ul className="-mb-px flex gap-6">
              {[
                { label: "Posts", href: base },
                { label: "About", href: `${base}/about` },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                    className={[
                      "inline-block border-b-2 px-1.5 py-3 text-sm",
                      isActive(href)
                        ? "border-emerald-600 font-medium text-slate-900"
                        : "border-transparent text-slate-600 hover:text-slate-900",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* Routed content */}
      {children}
    </div>
  );
}

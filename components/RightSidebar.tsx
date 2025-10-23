"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Candy, CalendarDays, MapPin, Users } from "lucide-react";

export default function RightSidebar() {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // If sidebar height < remaining container height, keep it sticky
      if (sidebarRect.height < containerRect.bottom) {
        setTop(Math.min(window.scrollY, containerRect.bottom - sidebarRect.height));
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="  ">
      <aside
        ref={sidebarRef}
        className="space-y-4"
      >
        {/* Alerts */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="relative mt-0.5 h-9 w-9">
              <span className="absolute inset-0 rounded-full bg-slate-100" />
              <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-900">Newton Patent</div>
              <div className="text-xs text-slate-500">Centreville</div>
            </div>
          </div>

          <Link
            href="/alerts"
            className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <span>See all alerts</span>
            <ChevronRight size={18} className="text-slate-400" />
          </Link>
        </div>

        {/* Treat Map promo */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-5 text-white shadow-sm">
          <h3 className="text-base font-semibold leading-6">
            Don’t be a ghost, explore Treat Map
          </h3>
          <Link
            href="/treat-map"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
          >
            <Candy size={18} />
            See Treat Map
          </Link>
        </div>

        {/* Upcoming event */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1520975928316-56c93f5f3c5d?q=80&w=800&auto=format&fit=crop"
            alt="Community event"
            className="h-28 w-full object-cover"
          />
          <div className="p-4">
            <h4 className="text-sm font-semibold text-slate-900">Neighborhood cleanup day</h4>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={14} />
                Sat, Oct 26 • 10:00 AM
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} />
                Community Park
              </span>
            </div>
            <Link
              href="/events/cleanup"
              className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <span>View details</span>
              <ChevronRight size={18} className="text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Suggested group */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=200&auto=format&fit=crop"
              alt="Group"
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900">Buy Nothing Burke</div>
              <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-600">
                <Users size={14} />
                4.2k members
              </div>
              <div className="mt-3">
                <Link
                  href="/groups/buy-nothing-burke"
                  className="inline-block rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  Join
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

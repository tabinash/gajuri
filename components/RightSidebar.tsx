"use client";

import Link from "next/link";
import { ChevronRight, Candy, CalendarDays, MapPin, Users, Bell, Calendar, Gift } from "lucide-react";

export default function RightSidebar() {
  return (
    <aside className="space-y-3 lg:space-y-4">
      {/* Alerts - Compact on md, full on lg */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 lg:p-4 shadow-sm">
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="relative h-8 w-8 lg:h-9 lg:w-9 shrink-0">
            <span className="absolute inset-0 rounded-full bg-slate-100" />
            <span className="absolute left-1/2 top-1/2 h-2 w-2 lg:h-2.5 lg:w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500 ring-2 lg:ring-4 ring-emerald-100" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">Newton Patent</div>
            <div className="text-xs text-slate-500 hidden lg:block">Centreville</div>
          </div>
        </div>

        <Link
          href="/alerts"
          className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm text-slate-700 hover:bg-slate-50"
        >
          <span>See alerts</span>
          <ChevronRight size={16} className="text-slate-400" />
        </Link>
      </div>

      {/* Treat Map promo - Compact on md */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-3 lg:p-5 text-white shadow-sm">
        <h3 className="text-sm lg:text-base font-semibold leading-snug">
          <span className="hidden lg:inline">Do not be a ghost, explore Treat Map</span>
          <span className="lg:hidden">Explore Treat Map</span>
        </h3>
        <Link
          href="/treat-map"
          className="mt-3 lg:mt-4 inline-flex items-center gap-1.5 lg:gap-2 rounded-full bg-orange-500 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-white hover:bg-orange-600"
        >
          <Candy size={16} />
          <span className="hidden lg:inline">See Treat Map</span>
          <span className="lg:hidden">View</span>
        </Link>
      </div>

      {/* Upcoming event - Hidden on compact, shown on lg */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

      {/* Compact event card for md screens */}
      <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Calendar size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-900 truncate">Cleanup day</div>
            <div className="text-xs text-slate-500">Sat, Oct 26</div>
          </div>
        </div>
      </div>

      {/* Suggested group - Responsive */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 lg:p-4 shadow-sm">
        <div className="flex items-center gap-2 lg:gap-3">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=200&auto=format&fit=crop"
            alt="Group"
            className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-900 truncate">Buy Nothing Burke</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-600">
              <Users size={12} className="lg:hidden" />
              <Users size={14} className="hidden lg:block" />
              <span className="hidden lg:inline">4.2k members</span>
              <span className="lg:hidden">4.2k</span>
            </div>
            <div className="mt-2 lg:mt-3">
              <Link
                href="/groups/buy-nothing-burke"
                className="inline-block rounded-full bg-emerald-600 px-2.5 lg:px-3 py-1 lg:py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              >
                Join
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

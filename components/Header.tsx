"use client";

import Link from "next/link";
import { Bell, MessageCircle, ChevronDown } from "lucide-react";

type Props = {
  user?: { name: string; avatar?: string };
  showUnreadDot?: boolean;
};

export default function TopHeader({
  user = { name: "Deepak" },
  showUnreadDot = true,
}: Props) {
  const initial =
    user.avatar ? undefined : (user.name?.trim()?.[0] || "U").toUpperCase();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/feed" className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center text-[#00A368]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M12 4 3 11.2v1.3L5 12v8h14v-8l2 .5v-1.3L12 4zM9 14h6v4H9v-4z" />
            </svg>
          </span>
          <span className="text-[20px] font-semibold leading-none text-[#00A368]">
            Nextdoor
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Bell */}
          <Link
            href="/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {showUnreadDot && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Messages"
          >
            <MessageCircle size={18} />
          </Link>

          {/* Avatar + chevron */}
          <button
            type="button"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-800"
            aria-label="Account menu"
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || "User"}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              initial
            )}
            <span className="absolute -right-1 -bottom-1 grid h-5 w-5 place-items-center rounded-full bg-slate-200 text-slate-700 shadow-sm ring-2 ring-white">
              <ChevronDown size={14} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
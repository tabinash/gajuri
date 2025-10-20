"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, SquarePen } from "lucide-react";

type Chat = {
  id: string;
  name: string;
  avatar?: string;
  last: string; // last message preview (without "You: ")
  time: string; // "1d", "2d", "1w"
  fromYou?: boolean;
  unread?: boolean;
};

const CHATS: Chat[] = [
  { id: "shraddha-khanal", name: "Shraddha Khanal", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop", last: "ye", time: "1d", fromYou: true },
  { id: "jenish-pyakurel", name: "Jenish Pyakurel", last: "Eh tmlai Pani congratulations bro", time: "2d" },
  { id: "laxman-bhandari", name: "Laxman Bhandari", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", last: "ok sir", time: "2d", fromYou: true },
  { id: "amrit-tiwari", name: "Amrit Tiwari", avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=200&auto=format&fit=crop", last: "Library ma paddai chu", time: "2d" },
  { id: "my-highness-sire", name: "My Highness Sire!!", avatar: "https://images.unsplash.com/photo-1520975922284-7b6835a8d3be?q=80&w=200&auto=format&fit=crop", last: "Ok", time: "2d", unread: true },
  { id: "sunita-tiwari", name: "Sunita Tiwari", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop", last: "You sent an attachment.", time: "2d", unread: true, fromYou: true },
  { id: "pralad-khadka", name: "Pralad Khadka", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop", last: "Ok", time: "3d" },
  { id: "hamro-csit", name: "Hamro CSIT", avatar: "https://images.unsplash.com/photo-1551292831-023188e78222?q=80&w=200&auto=format&fit=crop", last: "Hi Abinash , thanks for contacting us. Let …", time: "1w" },
  { id: "abishek-john-tiwari", name: "Abishek John Tiwari", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop", last: "You sent an attachment.", time: "2w", fromYou: true },
];

export default function ChatList() {
  const pathname = usePathname();
  const activeId = pathname?.split("/").filter(Boolean)[1] ?? null;

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return CHATS;
    return CHATS.filter(
      (c) => c.name.toLowerCase().includes(t) || c.last.toLowerCase().includes(t)
    );
  }, [q]);

  return (
    <div className="flex h-full w-full flex-col bg-transparent p-3">
      {/* Card container */}
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E6EB] bg-white shadow-sm">
        {/* Header */}
        <div className="sticky top-0 z-10 space-y-3 border-b border-[#E4E6EB] bg-white/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-slate-900">Chats</h2>
            <button
              aria-label="New chat"
              className="grid h-9 w-9 place-items-center rounded-full border border-[#E4E6EB] text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <SquarePen size={18} />
            </button>
          </div>

          <div className="flex items-center rounded-full bg-[#F0F2F5] px-3 ring-1 ring-transparent focus-within:ring-[#E4E6EB]">
            <Search size={16} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Messenger"
              className="ml-2 h-9 w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-2">
          <ul className="space-y-1">
            {filtered.map((c, idx) => {
              const isActive = c.id === activeId || (!activeId && idx === 0);
              return (
                <li key={c.id}>
                  <Link
                    href={`/messages/${c.id}`}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                      isActive ? "bg-[#E4E6EB]" : "hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <Avatar name={c.name} src={c.avatar} />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium text-slate-900">
                        {c.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-slate-600">
                        {c.fromYou && <span className="shrink-0">You:</span>}
                        <span className="truncate">{c.last}</span>
                        <span className="shrink-0">· {c.time}</span>
                      </div>
                    </div>

                    {c.unread && (
                      <span className="ml-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#1B74E4]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Avatar({ src, name }: { src?: string; name: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
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
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
      {initials}
    </div>
  );
}
"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w`;
  return date.toLocaleDateString();
}

function Avatar({ src, name }) {
  const [imgError, setImgError] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || imgError) {
    return (
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-200 text-base font-semibold text-slate-700 shadow-sm">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-10 w-10 shrink-0 rounded-full object-cover shadow-sm"
      onError={() => setImgError(true)}
    />
  );
}

export default function ChatList({
  conversations,
  selectedUserId,
  onSelectConversation,
  isLoading,
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return conversations;
    return conversations.filter(
      (c) =>
        c.otherUsername.toLowerCase().includes(t) ||
        c.lastMessage.toLowerCase().includes(t)
    );
  }, [q, conversations]);

  return (
    <div className="flex h-full w-full flex-col bg-transparent p-3">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E6EB] bg-white shadow-sm">
        {/* Header */}
        <div className="sticky top-0 z-10 space-y-3 border-b border-[#E4E6EB] bg-white/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold text-slate-900">Chats</h2>
          </div>

          <div className="flex items-center rounded-full bg-[#F0F2F5] px-3 ring-1 ring-transparent focus-within:ring-[#E4E6EB]">
            <Search size={16} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search friends, messages..."
              className="ml-2 h-9 w-full bg-transparent text-base outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-base text-slate-600">Loading...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-base text-slate-500">
                {q ? "No conversations found" : "No conversations yet"}
              </p>
            </div>
          ) : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const isActive = String(c.otherUserId) === selectedUserId;
                const hasUnread = c.hasUnreadMessages;

                return (
                  <li key={c.otherUserId}>
                    <button
                      onClick={() => onSelectConversation(String(c.otherUserId))}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors text-left",
                        isActive
                          ? "bg-[#E4E6EB]"
                          : hasUnread
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <Avatar name={c.otherUsername} src={c.profilePicture} />

                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate text-base ${
                            hasUnread
                              ? "font-bold text-slate-900"
                              : "font-medium text-slate-900"
                          }`}
                        >
                          {c.otherUsername}
                        </div>
                        <div
                          className={`mt-0.5 flex items-center gap-1 truncate text-sm ${
                            hasUnread ? "text-slate-800 font-semibold" : "text-slate-500"
                          }`}
                        >
                          <span className="truncate">{c.lastMessage}</span>
                          <span className="shrink-0">
                            · {formatTimestamp(c.lastMessageTime)}
                          </span>
                        </div>
                      </div>

                      {/* Blue unread indicator dot */}
                      {hasUnread && (
                        <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#1B74E4]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

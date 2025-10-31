"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-200 text-base font-semibold text-slate-700">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="h-14 w-14 shrink-0 rounded-full object-cover"
      onError={() => setImgError(true)}
    />
  );
}

export default function ChatList({
  conversations,
  isLoading,
}) {
  const router = useRouter();
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

  const handleSelectConversation = (userId) => {
    router.push(`/m/message?userId=${userId}`);
  };

  return (
<div className="flex h-screen w-full flex-col bg-white -px-2 ">
      {/* Search Bar - Fixed at top */}
      <div className="shrink-0 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5">
          <Search size={18} className="shrink-0 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages..."
            className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Conversation List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#1B74E4]" />
              <p className="text-sm text-slate-600">Loading...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <p className="text-base font-medium text-slate-900">
                {q ? "No conversations found" : "No messages yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {q ? "Try a different search" : "Start messaging your neighbors"}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((c) => {
              const hasUnread = c.hasUnreadMessages; // TODO: Add unread logic

              return (
                <li key={c.otherUserId}>
                  <button
                    onClick={() => handleSelectConversation(String(c.otherUserId))}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-slate-50"
                  >
                    <Avatar name={c.otherUsername} src={c.profilePicture} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className={`truncate text-[15px] ${hasUnread ? 'font-bold' : 'font-semibold'} text-slate-900`}>
                          {c.otherUsername}
                        </h3>
                        <span className="shrink-0 text-xs text-slate-500">
                          {formatTimestamp(c.lastMessageTime)}
                        </span>
                      </div>
                      <p className={`mt-0.5 truncate text-sm ${hasUnread ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                        {c.lastMessage}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {hasUnread && (
                      <div className="h-3 w-3 shrink-0 rounded-full bg-[#1B74E4]" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

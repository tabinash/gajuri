"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { conversationRepository } from "@/repositories/conversationRepository";
import logo from "@/assets/logo.png";

export default function MobileHeader() {
  const pathname = usePathname();

  const isFeedPage = pathname === "/m/feed" || pathname === "/m/feed/news&notice";

  const getPageTitle = () => {
    if (pathname?.startsWith("/m/feed")) return "Gajuri";
    if (pathname?.startsWith("/m/jobs")) return "Jobs";
    if (pathname?.startsWith("/m/market")) return "Market";
    if (pathname?.startsWith("/m/messages") || pathname === "/m/message") return "Messages";
    if (pathname?.startsWith("/m/profile")) return "Profile";
    return "Gajuri";
  };

  // Reuse the same conversations query with the same config
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await conversationRepository.getConversations();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 2, // Poll every 2 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Calculate unread count from conversations
  // Assuming each conversation has an 'unreadCount' or 'hasUnread' property
  const unreadCount = conversations.reduce((total, conv) => {
    return total + (conv.unreadCount || 0);
  }, 0);

  // OR if you just want to count conversations with unread messages:
  // const unreadCount = conversations.filter(conv => conv.hasUnread || conv.unreadCount > 0).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      {/* First Row: Logo + Messages */}
      <div className="flex h-14 items-center justify-between px-5">
        {/* Left: Logo */}
        <Link href="/m/feed" className="flex items-center">
          <Image
            src={logo}
            alt="Gajuri logo"
            width={100}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* Right: Messages with Badge */}
        <Link
          href="/m/messages"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm active:bg-slate-100"
        >
          <MessageSquare size={22} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>
      </div>

      {/* Second Row: Feed Tabs (only on feed pages) */}
      {isFeedPage && (
        <div className="flex items-center ">
          <Link
            href="/m/feed"
            className={`flex-1 text-center px-6 py-4 font-bold text-[16px] transition-all relative ${
              pathname === "/m/feed"
                ? "text-blue-600"
                : "text-slate-600 active:text-slate-900 active:bg-slate-50"
            }`}
          >
            General Posts
            {pathname === "/m/feed" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </Link>
          <Link
            href="/m/feed/news&notice"
            className={`flex-1 text-center px-6 py-4 font-bold text-[16px] transition-all relative ${
              pathname === "/m/feed/news&notice"
                ? "text-blue-600"
                : "text-slate-600 active:text-slate-900 active:bg-slate-50"
            }`}
          >
            News & Notice
            {pathname === "/m/feed/news&notice" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
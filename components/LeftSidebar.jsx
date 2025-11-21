"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ShoppingBag,
  Compass,
  Users,
  BriefcaseBusiness,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { useClickOutside, useCurrentUser } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { conversationRepository } from "@/repositories/conversationRepository";

const items = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "People", href: "/people", icon: Users },
  { label: "Market", href: "/market", icon: ShoppingBag },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useClickOutside(() => setShowProfileMenu(false));
  const currentUser = useCurrentUser() || {};
  const { user, userId, username, avatar } = currentUser;

  // Fetch conversations for unread count
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await conversationRepository.getConversations();
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    },
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    retry: 3,
  });

  const unreadCount = conversations.reduce((total, conv) => {
    return total + (conv.unreadCount || 0);
  }, 0);

  const profile = {
    id: userId,
    name: username,
    avatar: avatar,
  };

  const handleLogout = () => {
    localStorage.removeItem("gajuri-authToken");
    localStorage.removeItem("chemiki-userProfile");
    router.push("/login");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="p-4 md:px-5 md:pt-6">
        <Link href="/feed" className="flex items-center justify-center md:justify-start">
          {/* Icon only on small screens */}
          <div className="md:hidden">
            <Image
              src={logo}
              alt="Gajuri"
              width={44}
              height={44}
              className="object-contain"
              priority
            />
          </div>
          {/* Full logo on md+ screens */}
          <div className="hidden md:block">
            <Image
              src={logo}
              alt="Gajuri logo"
              width={140}
              height={55}
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 md:p-4 md:pt-2">
        <ul className="space-y-1 md:space-y-2">
          {items.map(({ label, href, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== "/feed" && pathname?.startsWith(href));

            const linkHref =
              href === "/market" || href === "/messages" || href === "/jobs"
                ? { pathname: href, query: { hide: "true" } }
                : href;

            const isMessages = href === "/messages";
            const showBadge = isMessages ;

            return (
              <li key={href}>
                <Link
                  href={linkHref}
                  aria-current={active ? "page" : undefined}
                  title={label}
                  className={[
                    "flex items-center justify-center md:justify-start gap-3 rounded-xl p-3 md:px-4 md:py-3 transition-colors relative",
                    active
                      ? "bg-slate-100 font-semibold text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <div className="relative">
                    {/* Larger icons on icon-only mode */}
                    <Icon
                      size={27}
                      strokeWidth={active ? 2 : 1.5}
                      className={`md:hidden ${active ? "text-slate-900" : "text-slate-600"}`}
                    />
                    {/* Icons on full mode */}
                    <Icon
                      size={26}
                      strokeWidth={active ? 2.5 : 2}
                      className={`hidden md:block ${active ? "text-slate-900" : "text-slate-600"}`}
                    />
                    {showBadge && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount} 
                      </span>
                    )}
                  </div>
                  {/* Label - hidden on small screens */}
                  <span className="hidden md:block text-lg tracking-tight">
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom: profile */}
      <div className="relative p-2 md:p-3" ref={menuRef}>
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title={profile.name || "Profile"}
          className="w-full flex items-center justify-center md:justify-start gap-3 rounded-lg p-2 md:px-3 md:py-2.5 hover:bg-slate-50 transition-colors"
        >
          <img
            src={profile.avatar ?? undefined}
            alt={`${profile.name ?? "User"} avatar`}
            className="h-10 w-10 rounded-full object-cover"
          />
          {/* Profile info - hidden on small screens */}
          <div className="hidden md:block min-w-0 flex-1 text-left">
            <div className="truncate text-lg font-semibold text-slate-900">
              {profile.name}
            </div>
            <div className="text-base text-slate-500">Options</div>
          </div>
        </button>

        {showProfileMenu && (
          <div className="absolute bottom-full left-2 right-2 md:left-3 md:right-3 mb-2 rounded-lg border border-slate-200 bg-white shadow-lg z-50 py-1">
            <Link
              href={{
                pathname: "/profile",
                query: { userId: profile.id },
              }}
              onClick={() => setShowProfileMenu(false)}
              className="w-full px-4 py-3 text-left text-lg text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <User size={20} className="text-slate-500" />
              <span className="hidden md:inline">Visit Profile</span>
              <span className="md:hidden">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-lg text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <LogOut size={20} className="text-red-500" />
              <span className="hidden md:inline">Log Out</span>
              <span className="md:hidden">Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
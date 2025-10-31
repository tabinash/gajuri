"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Compass,
  ShoppingBag,
  BriefcaseBusiness,
  User,
  LogOut,
} from "lucide-react";
import { useCurrentUser, useClickOutside } from "@/hooks";

export default function BottomNav() {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useClickOutside(() => setShowProfileMenu(false));

  const tabs = [
    { name: "Feed", href: "/m/feed", icon: Home },
    { name: "Explore", href: "/m/explore", icon: Compass },
    { name: "Market", href: "/m/market", icon: ShoppingBag },
    { name: "Jobs", href: "/m/jobs", icon: BriefcaseBusiness },
  ];

  const handleLogout = () => {
    localStorage.removeItem("gajuri-authToken");
    localStorage.removeItem("chemiki-userProfile");
    router.push("/login");
  };

  const isActive = (href) => {
    if (href.startsWith("/m/profile"))
      return pathname?.startsWith("/m/profile");
    if (href === "/m/feed")
      return pathname === "/m/feed" || pathname === "/m/feed/news&notice";
    if (href === "/m/explore") return pathname?.startsWith("/m/explore");
    if (href === "/m/market") return pathname?.startsWith("/m/market");
    if (href === "/m/jobs") return pathname?.startsWith("/m/jobs");
    return pathname === href;
  };

  const profileActive = pathname?.startsWith("/m/profile");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white safe-area-inset-bottom">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-all duration-200 ${
                active ? "scale-105" : "scale-100"
              }`}
            >
              <div
                className={`grid h-7 w-7 place-items-center transition-transform duration-200 ${
                  active ? "text-slate-700 scale-110" : "text-slate-500 scale-100"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  active ? "text-slate-700" : "text-slate-500"
                }`}
              >
                {tab.name}
              </span>
            </Link>
          );
        })}

        {/* Profile Button with Menu */}
        <div className="relative flex-1" ref={menuRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`w-full flex flex-col items-center justify-center gap-1 py-1 transition-all duration-200 ${
              profileActive ? "scale-105" : "scale-100"
            }`}
          >
            <div
              className={`grid h-7 w-7 place-items-center transition-transform duration-200 ${
                profileActive ? "text-slate-700 scale-110" : "text-slate-500 scale-100"
              }`}
            >
              <User size={22} strokeWidth={profileActive ? 2.5 : 2} />
            </div>
            <span
              className={`text-xs font-medium transition-colors duration-200 ${
                profileActive ? "text-slate-700" : "text-slate-500"
              }`}
            >
              Profile
            </span>
          </button>

          {/* Profile Menu */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
              <Link
                href={user?.id ? `/m/profile?userId=${user.id}` : "/m/profile"}
                onClick={() => setShowProfileMenu(false)}
                className="w-full px-4 py-3 text-left text-sm text-slate-700 active:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <User size={18} className="text-slate-500" />
                Visit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 active:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut size={18} className="text-red-500" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

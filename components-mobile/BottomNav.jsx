"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Users,
  ShoppingBag,
  BriefcaseBusiness,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Feed", href: "/m/feed", icon: Home },
    { name: "Explore", href: "/m/explore", icon: Compass },
    { name: "People", href: "/m/people", icon: Users },
    { name: "Market", href: "/m/market", icon: ShoppingBag },
    { name: "Jobs", href: "/m/jobs", icon: BriefcaseBusiness },
  ];

  const isActive = (href) => {
    if (href === "/m/feed")
      return pathname === "/m/feed" || pathname === "/m/feed/news&notice";
    if (href === "/m/explore") return pathname?.startsWith("/m/explore");
    if (href === "/m/people") return pathname?.startsWith("/m/people");
    if (href === "/m/market") return pathname?.startsWith("/m/market");
    if (href === "/m/jobs") return pathname?.startsWith("/m/jobs");
    return pathname === href;
  };

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

      </div>
    </nav>
  );
}

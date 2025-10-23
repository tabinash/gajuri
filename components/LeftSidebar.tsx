"use client";

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Home,
  ShoppingBag,
  Compass,
  BriefcaseBusiness,
  MessageSquare,
  User,
  LogOut,
} from "lucide-react";
import logo from "@/assets/logo.png";
 
export const SIDEBAR_WIDTH = 264;

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const items: Item[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "For Sale & Free", href: "/market", icon: ShoppingBag },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const fontStack =
    '"Inter", "Segoe UI", SegoeUI, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
  
  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
  
  const profile = {
    id: userData?.id,
    name: userData?.username,
    avatar: userData?.profilePhotoUrl,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage - remove both keys
    localStorage.removeItem("gajuri-authToken");
    localStorage.removeItem("chemiki-userProfile");
    
    // Redirect to login page
    router.push("/login");
  };

  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <aside
        className="fixed inset-y-0 left-0 z-40 ml-4 bg-white"
        style={{ width: SIDEBAR_WIDTH, fontFamily: fontStack }}
        aria-label="Primary"
      >
        <div className="flex h-full flex-col">
          {/* Brand */}
          <div className="px-10 pt-5 ">
            <Link href="/feed" className="flex items-center gap-2">
              <Image
                src={logo}
                alt="Gajuri logo"
                width={140}
                height={60}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Nav */}
          <nav className="p-4 px-6  flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {items.map(({ label, href, icon: Icon }) => {
                const active =
                  pathname === href || (href !== "/feed" && pathname?.startsWith(href));

                const linkHref =
                  href === "/market" || href === "/messages" || href === "/jobs"
                    ? { pathname: href, query: { hide: "true" } }
                    : href;

                return (
                  <li key={href}>
                    <Link
                      href={linkHref}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "flex items-center gap-3 rounded-md px-3 py-2 text-[18px] transition-colors",
                        active
                          ? "font-semibold text-slate-900"
                          : "text-slate-800 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <Icon
                        size={24}
                        className={active ? "text-slate-900" : "text-slate-800"}
                      />
                      <span className="tracking-tight">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom: profile */}
          <div className="mb-9 relative" ref={menuRef}>
            <div className="px-6 pb-3">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-full flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <img
                  src={profile.avatar}
                  alt={`${profile.name} avatar`}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {profile.name}
                  </div>
                  <div className="text-sm text-slate-500">View options</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-6 right-6 mb-2 rounded-lg border border-slate-200 bg-white shadow-lg z-50 py-1">
                  <Link
                    href={{
                      pathname: "/profile",
                      query: { userId: profile.id },
                    }}
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full px-4 py-2.5 text-left text-base text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <User size={18} className="text-slate-500" />
                    Visit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-base text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={18} className="text-red-500" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
"use client";

import Head from "next/head";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Compass,
  BriefcaseBusiness,
  MessageSquare,
  Newspaper,
  Bell,
} from "lucide-react";

export const SIDEBAR_WIDTH = 264;

type Item = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const items: Item[] = [
  { label: "Home", href: "/feed", icon: Home },
  { label: "News&Notice", href: "/news&notice", icon: Newspaper },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "For Sale & Free", href: "/market", icon: ShoppingBag },
  { label: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { label: "Messages", href: "/messages", icon: MessageSquare },
];

export default function LeftSidebar() {
  const pathname = usePathname();
  const fontStack =
    '"Inter", "Segoe UI", SegoeUI, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

  const profile = {
    name: "Abinash",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
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
          <div className="px-10 pt-5 pb-4">
            <Link href="/feed" className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center text-[#00A368]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 4 3 11.2v1.3L5 12v8h14v-8l2 .5v-1.3L12 4zM9 14h6v4H9v-4z" />
                </svg>
              </span>
              <span className="text-[25px] font-semibold leading-none text-[#00A368]">
                Nextdoor
              </span>
            </Link>
          </div>

          {/* Nav */}
          <nav className="p-4 px-6 flex-1 overflow-y-auto">
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
                        "flex items-center gap-3 rounded-md px-3 py-2 text-[18px] transition-colors", // increased from 15px → 16px
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

            {/* Post button */}
            <div className="mt-6">
              <Link
                href="/post"
                className="mx-1 block w-[180px] rounded-full bg-[#00A368] px-5 py-2.5 text-center text-[15px] font-medium text-white transition-colors hover:brightness-95"
              >
                Post
              </Link>
            </div>
          </nav>

          {/* Bottom: profile */}
          <div className="mb-9">
            <div className="px-6 pb-3">
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-slate-50"
              >
                <img
                  src={profile.avatar}
                  alt={`${profile.name} avatar`}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-medium text-slate-900">
                    {profile.name}
                  </div>
                  <div className="text-[13px] text-slate-500">View profile</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

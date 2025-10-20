"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FeedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Header Tabs */}
      <div className="flex border-b border-gray-300">
        <TabButton
          label="General Posts"
          href="/feed"
          active={pathname === "/feed"}
        />
        <TabButton
          label="News & Notice"
          href="/feed/news&notice"
          active={pathname === "/feed/news&notice"}
        />
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

function TabButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 -mb-px font-medium text-sm border-b-2 transition-colors ${
        active
          ? "border-blue-500 text-blue-600"
          : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
      }`}
    >
      {label}
    </Link>
  );
}

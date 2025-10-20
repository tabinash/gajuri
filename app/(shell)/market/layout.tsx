"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function MarketLayout({ children }: Props) {
  const pathname = usePathname();

  const tabs = [
    {
      label: "All listings",
      href: { pathname: "/market", query: { hide: "true" } },
    },
    {
      label: "Your listings",
      href: { pathname: "/market/your-items", query: { hide: "true" } },
    },
  ];

  return (
    <section className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-6">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href.pathname ||
              (tab.href.pathname !== "/market" &&
                pathname.startsWith(tab.href.pathname));

            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`-mb-px pb-3 text-sm transition-colors ${
                  isActive
                    ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}

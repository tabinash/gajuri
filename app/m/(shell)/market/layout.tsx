// MarketLayout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { Plus } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function MarketLayout({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're on a product detail page or new product page
  const isProductDetail = pathname.startsWith("/m/market/") &&
                          pathname !== "/m/market" &&
                          !pathname.includes("your-items");
  const isNewProduct = pathname === "/m/market/new";

  // If product detail page or new product page, just render children without tabs/header
  if (isProductDetail || isNewProduct) {
    return <>{children}</>;
  }

  const tabs = [
    { label: "All products", href: { pathname: "/m/market", query: { hide: "true" } } },
    { label: "Your products", href: { pathname: "/m/market/your-items", query: { hide: "true" } } },
  ];

  return (
    <section>
      {/* Tabs + Add Product - Mobile optimized */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/m/market" && pathname.startsWith(tab.href.pathname));
              return (
                <Link
  key={tab.label}
  href={tab.href}
  className={`pb-0.5 text-base font-semibold transition-colors ${
    isActive
      ? "border-b-2 border-blue-600 text-slate-900"
      : "text-slate-600 active:text-slate-800"
  }`}
  style={{
    fontFamily: "'Poppins', sans-serif", // 👈 directly embed custom font
  }}
>
  {tab.label}
</Link>

              );
            })}
          </div>

          <button
            onClick={() => router.push("/m/market/new")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white active:bg-blue-700 transition-colors shrink-0"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>
    </section>
  );
}
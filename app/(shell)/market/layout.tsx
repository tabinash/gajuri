// MarketLayout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import NewListingModal from "./NewListingModal";

type Props = {
  children: React.ReactNode;
};

export default function MarketLayout({ children }: Props) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { label: "All products", href: { pathname: "/market", query: { hide: "true" } } },
    { label: "Your products", href: { pathname: "/market/your-items", query: { hide: "true" } } },
  ];

  return (
    <section className="space-y-6">
      {/* Tabs + Add Product */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/market" && pathname.startsWith(tab.href.pathname));
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`-mb-px pb-3 text-[15px] font-bold transition-colors ${
                    isActive
                      ? "border-b-2 border-slate-900 text-slate-900"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-3xl bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Modal - only controls open/close */}
      {/* <NewListingModal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
      /> */}

      {showModal && <NewListingModal open={showModal} onClose={() => setShowModal(false)} />}
    </section>
  );
}
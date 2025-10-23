// JobsLayout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import NewListingModal from "./NewListingModal ";

type Props = {
  children: React.ReactNode;
};

export default function JobsLayout({ children }: Props) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  const tabs = [
    { label: "All listings", href: { pathname: "/jobs", query: { hide: "true" } } },
    { label: "Your listings", href: { pathname: "/jobs/your-jobs", query: { hide: "true" } } },
  ];

  return (
    <section className="">
      {/* Tabs + Add Product */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/jobs" && pathname.startsWith(tab.href.pathname));
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`-mb-px pb-3 text-lg font-bold transition-colors ${
                    isActive
                      ? "border-b-2 border-slate-700 text-slate-700"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Post your Job
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
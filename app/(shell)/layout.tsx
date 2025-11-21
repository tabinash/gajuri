"use client";

import React, { Suspense } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Responsive Layout (max-width: 1200px):
 * - 640-768px:  Icon-only left sidebar (72px), main content, no right sidebar
 * - 768-1024px: Full left sidebar (220px), main content, compact right sidebar (200px)
 * - 1024px+:    Full left sidebar (220px), main content, full right sidebar (300px)
 */

function ShellLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hide = searchParams.get("hide");

  const isMessagesPage =
    pathname === "/messages" || pathname.startsWith("/messages/");

  const hideRightSidebar = hide || isMessagesPage;

  return (
    <div className="min-h-dvh w-full max-w-[1200px]">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="sticky top-0 h-dvh shrink-0  bg-white w-[72px] md:w-[220px]">
          <LeftSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className={isMessagesPage ? "" : "px-4 py-4"}>
            {children}
          </div>
        </main>

        {/* Right Sidebar - progressive: hidden → compact (md) → full (lg) */}
        {!hideRightSidebar && (
          <aside className="hidden md:block sticky top-0 h-dvh shrink-0 w-[200px] lg:w-[300px] bg-white">
            <div className="h-full overflow-y-auto p-3 lg:p-4">
              <RightSidebar />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center">Loading...</div>}>
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </Suspense>
  );
}

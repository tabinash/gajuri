"use client";

import React, { Suspense, useState, useEffect } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { usePathname, useSearchParams } from "next/navigation";

function ShellLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hide = searchParams.get("hide");

  const isMessagesPage =
    pathname === "/messages" || pathname.startsWith("/messages/");

  // Track window width
  const [windowWidth, setWindowWidth] = useState<number>(0);
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Left sidebar width based on screen size
  const leftSidebarWidth = windowWidth >= 768 ? 200 : 80; // 768px = tablet
  const mainContentPL = leftSidebarWidth + 60; // 60px gap

  // Show right sidebar only on large screens
  const showRightSidebar = !hide && !isMessagesPage && windowWidth >= 1024; // >=1024px

  // Main content span (grid)
  const mainContentColSpan = showRightSidebar ? "col-span-9" : "col-span-13";

  return (
    <div className={`min-h-dvh ${hide ? "max-w-7xl" : "max-w-6xl"} mx-auto`}>
      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-14 z-30 h-[calc(100dvh-56px)] border-r border-gray-200 bg-white`}
        style={{ width: `${leftSidebarWidth}px` }}
      >
        <div className="h-full overflow-y-auto">
          <LeftSidebar />
        </div>
      </aside>

      {/* Main content */}
      <div style={{ paddingLeft: `${mainContentPL}px` }}>
        <div className={`w-full ${isMessagesPage ? "ml-2" : "px-8 py-4"}`}>
          <div
            className={`grid ${
              isMessagesPage ? "grid-cols-1 gap-0" : "grid-cols-13 gap-4"
            }`}
          >
            {/* Main content */}
            <main className={`min-w-0 ${mainContentColSpan}`}>{children}</main>

            {/* Right Sidebar */}
            {showRightSidebar && (
              <aside className="col-span-4">
                <div className="h-[calc(100dvh-56px)] w-[280px] space-y-4">
                  <RightSidebar />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>Loading layout...</div>}>
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </Suspense>
  );
}

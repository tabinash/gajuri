"use client";
import React, { Suspense } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { usePathname, useSearchParams } from "next/navigation";

function ShellLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hide = searchParams.get("hide");

  const isMessagesPage =
    pathname === "/messages" || pathname.startsWith("/messages/");

  return (
    <div
      className={`min-h-dvh ${hide ? "max-w-7xl" : "max-w-6xl"}`}
    >
      {/* Left Sidebar — always visible */}
      <aside className="fixed left-0 top-14 z-30 h-[calc(100dvh-56px)] w-[200px] border-r border-gray-200 bg-white">
        <div className="h-full overflow-y-auto">
          <LeftSidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="ml-[260px]">
        <div className={`w-full ${isMessagesPage ? "ml-2" : "px-8 py-4"}`}>
          <div
            className={`grid ${isMessagesPage ? "grid-cols-1 gap-0" : "grid-cols-13 gap-4"}`}
          >
            {/* Main content */}
            <main
              className={`min-w-0 ${
                isMessagesPage || hide ? "col-span-13 w-full" : "col-span-9"
              }`}
            >
              {children}
            </main>

            {/* Right Sidebar — hide on /messages */}
            {!hide && !isMessagesPage && (
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

export default function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh max-w-6xl">
          {/* Left Sidebar Skeleton */}
          <aside className="fixed left-0 top-14 z-30 h-[calc(100dvh-56px)] w-[200px] border-r border-gray-200 bg-white">
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-slate-200 animate-pulse"
                />
              ))}
            </div>
          </aside>

          {/* Main content area skeleton */}
          <div className="ml-[260px]">
            <div className="w-full px-8 py-4">
              <div className="grid grid-cols-13 gap-4">
                {/* Main content skeleton */}
                <main className="min-w-0 col-span-9">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-slate-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-32 rounded bg-slate-200" />
                              <div className="h-3 w-24 rounded bg-slate-200" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 w-full rounded bg-slate-200" />
                            <div className="h-4 w-5/6 rounded bg-slate-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </main>

                {/* Right Sidebar skeleton */}
                <aside className="col-span-4">
                  <div className="h-[calc(100dvh-56px)] w-[280px] space-y-4">
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                      <div className="space-y-3">
                        <div className="h-5 w-32 rounded bg-slate-200" />
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-24 rounded bg-slate-200" />
                              <div className="h-3 w-16 rounded bg-slate-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </Suspense>
  );
}
"use client";
import React, { Suspense } from "react";
import BottomNav from "@/components-mobile/BottomNav";
import MobileHeader from "@/components-mobile/Header";
import { usePathname } from "next/navigation";

function ShellLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  // Pages where we need full-screen (no header/nav)
  const isMessageThread = pathname === "/m/message";
  const isPostDetail = pathname.startsWith("/m/feed/") && pathname !== "/m/feed" && !pathname.includes("news&notice");
  const isProfilePostDetail = pathname === "/m/profile/post";
  const isMarketDetail = pathname.startsWith("/m/market/") && pathname !== "/m/market" && !pathname.includes("your-items");
  const isMarketNew = pathname === "/m/market/new";
  const isJobDetail = pathname.startsWith("/m/jobs/") && pathname !== "/m/jobs" && !pathname.includes("your-jobs");
  const isJobNew = pathname === "/m/jobs/new";

  // Pages with no padding
  const isMessages = pathname === "/m/messages";
  const isFeed = pathname.startsWith("/m/feed");
  const isProfile = pathname === "/m/profile";
  const isProfileEdit = pathname === "/m/profile/edit";

  // Only show header on feed pages
  const isFeedPage = pathname === "/m/feed" || pathname === "/m/feed/news&notice";

  // Full screen mode for chat thread, post detail, profile edit, market detail, new product, job detail, and new job (no header, no bottom nav)
  if (isMessageThread || isPostDetail || isProfilePostDetail || isProfileEdit || isMarketDetail || isMarketNew || isJobDetail || isJobNew) {
    return <>{children}</>;
  }

  // Feed pages: Header + Bottom Nav
  if (isFeedPage) {
    return (
      <div className="min-h-screen bg-white">
        {/* Mobile Header - Only on feed */}
        <MobileHeader />

        {/* Main content */}
        <main className="pb-16">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

  // All other pages: No header, only Bottom Nav
     return (
      <div className="min-h-screen bg-white">
        {/* Mobile Header - Only on feed */}
        <MobileHeader />

        {/* Main content */}
        <main className="pb-16 px-2">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
}

export default function ShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <main className="pb-16">
            <div className="px-4 py-3">
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 rounded bg-slate-200" />
                          <div className="h-3 w-24 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full rounded bg-slate-200" />
                        <div className="h-4 w-4/5 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
          <BottomNav />
        </div>
      }
    >
      <ShellLayoutContent>{children}</ShellLayoutContent>
    </Suspense>
  );
}

"use client";
import React from "react";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";
import { usePathname, useSearchParams } from "next/navigation";

export default function ShellLayout({
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
      <aside className="fixed left-0 top-14  z-30 h-[calc(100dvh-56px)] w-[200px] border-r border-gray-200 bg-white ">
        <div className="h-full overflow-y-auto">
          <LeftSidebar />
        </div>
      </aside>

      {/* Main content area */}
      <div className="ml-[260px] ">
        <div className={`w-full ${isMessagesPage ?"ml-2":"px-8 py-4"} `}>
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
                <div className=" h-[calc(100dvh-56px)] w-[280px] space-y-4 ">
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

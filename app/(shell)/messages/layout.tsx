"use client";

import React from "react";
import ChatList from "./ChatList";

export default function MessagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen  justify-center bg-gray-50 overflow-hidden">
      {/* App shell width */}
      <div className="flex h-full w-full  border-x border-gray-200 bg-white">
        {/* Left: chat list (no page scroll) */}
        <aside className="hidden  md:flex md:w-[300px] lg:w-[450px]overflow-hidden">
          <div className="h-full w-full">
            <ChatList />
          </div>
        </aside>

        {/* Right: chat thread container (no page scroll) */}
        <main className="flex-1 h-full overflow-hidden">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
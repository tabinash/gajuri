"use client";

import React from "react";

export default function MessagesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen justify-center bg-gray-50 overflow-hidden">
      {/* App shell width */}
      <div className="flex h-full w-full border-x border-gray-200 bg-white">
        {children}
      </div>
    </div>
  );
}
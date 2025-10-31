import React from "react";

export default function SignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-dvh bg-white">
      <div className="mx-auto max-w-md px-6 py-8">
        {children}
      </div>
    </main>
  );
}

import React from "react";

export default function SignupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="relative min-h-dvh">
      {/* Background (Unsplash) */}
      <img
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80"
        alt="Park background"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center p-4 sm:p-6">
        <div className="w-full">{children}</div>
      </div>
    </main>
  );
}

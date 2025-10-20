"use client";

import { usePathname } from "next/navigation";

function useUserFromPath() {
  const pathname = usePathname();
  const id = pathname?.split("/")[2] ?? "user";
  const name = id
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return { id, name };
}

export default function OtherProfileAboutPage() {
  const { name } = useUserFromPath();
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <section className="xl:col-span-8">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">About {name}</h2>
          <p className="mt-2 text-[15px] leading-7 text-slate-700">
            {name} is a neighbor in Willow Creek. Public profile details are limited
            for privacy. Connect to see more updates and interact on posts.
          </p>
        </div>
      </section>

      <aside className="xl:col-span-4 space-y-4">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Mutual neighbors</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop"
                alt="Sarah avatar"
                className="h-7 w-7 rounded-full object-cover"
              />
              Sarah Johnson
            </li>
            <li className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop"
                alt="Mike avatar"
                className="h-7 w-7 rounded-full object-cover"
              />
              Mike Chen
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

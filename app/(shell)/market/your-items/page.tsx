"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Listing = {
  id: string;
  title: string;
  price: string;
  time: string;
  distance: string;
  city: string;
  image: string;
  sold?: boolean;
};

function MarketCard({ listing }: { listing: Listing }) {
  const { id, title, price, time, distance, city, image } = listing;
  return (
    <Link
      href={{
        pathname: `/market/${id}`,
        query: { hide: "true" },
      }}
      className="snap-start block shrink-0 rounded-2xl bg-white transition"
    >
      <div className="p-2">
        <div className="overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            className="h-[170px] w-full object-cover"
            loading="lazy"
          />
        </div>

        <div className="mt-2 space-y-0.5 px-1 pb-2">
          <div className="text-[13px] font-semibold tracking-tight text-slate-900">
            {price.toUpperCase()}
          </div>
          <div className="truncate text-[15px] text-slate-800">{title}</div>
          <div className="text-[12px] text-slate-500">
            {time} • {distance} • {city}
          </div>
        </div>
      </div>
    </Link>
  );
}

const DATA: Listing[] = [
  {
    id: "1",
    title: "Set of Sturdy Bed with ...",
    price: "FREE",
    time: "18 min ago",
    distance: "12.0 mi",
    city: "Ashburn",
    image:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Pink Kids Bicycle",
    price: "FREE",
    time: "19 min ago",
    distance: "14.4 mi",
    city: "Annandale",
    image:
      "https://images.unsplash.com/photo-1520975928316-56c93f5f3c5d?q=80&w=800&auto=format&fit=crop",
    sold: true,
  },
  {
    id: "3",
    title: "Harry Potter Universal Studio Pin Set",
    price: "FREE",
    time: "1 min ago",
    distance: "12.5 mi",
    city: "Falls Church",
    image:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Armchair",
    price: "$175",
    time: "Just now",
    distance: "7.6 mi",
    city: "Reston",
    image:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "Toboggan",
    price: "$50",
    time: "12 min ago",
    distance: "11.8 mi",
    city: "Broadlands",
    image:
      "https://images.unsplash.com/photo-1611389622051-21c6b66dbe49?q=80&w=800&auto=format&fit=crop",
    sold: true,
  },
];

export default function MarketPage() {
  const [tab, setTab] = useState<"all" | "sold">("all");

  const listings = useMemo(() => {
    let arr = DATA;
    if (tab === "sold") arr = arr.filter((l) => l.sold);
    return arr;
  }, [tab]);

  return (
    <section className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center gap-6">
          <button
            className={`-mb-px pb-3 text-sm transition-colors ${
              tab === "all"
                ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                : "text-slate-600 hover:text-slate-800"
            }`}
            onClick={() => setTab("all")}
          >
            All
          </button>

          <button
            className={`-mb-px pb-3 text-sm transition-colors ${
              tab === "sold"
                ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                : "text-slate-600 hover:text-slate-800"
            }`}
            onClick={() => setTab("sold")}
          >
            Sold
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {listings.map((l) => (
          <MarketCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}

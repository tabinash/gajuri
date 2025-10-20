"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Listing = {
    id: string;
    title: string;
    price: string; // "FREE" | "$175"
    time: string; // "18 min ago"
    distance: string; // "12.0 mi"
    city: string; // "Ashburn"
    image: string;
    mine?: boolean;
    category: string; // "Furniture" | ...
};

function MarketCard({ listing }: { listing: Listing }) {
    const { id, title, price, time, distance, city, image } = listing;
    return (
        <Link
              href={{
        pathname:`/market/${id}`,
        query: { hide: "true" },
      }}
            className="snap-start block  shrink-0 rounded-2xl bg-white transition"
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

const CATEGORIES = [
    "All categories",
    "Furniture",
    "Toys",
    "Books",
    "Electronics",
    "Home",
] as const;

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
        category: "Furniture",
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
        category: "Toys",
        mine: true,
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
        category: "Books",
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
        category: "Furniture",
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
        category: "Toys",
    },
    {
        id: "6",
        title: "Reading Lamp",
        price: "$25",
        time: "30 min ago",
        distance: "5.2 mi",
        city: "Fairfax",
        image:
            "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop",
        category: "Home",
        mine: true,
    },
    {
        id: "7",
        title: "Coffee Table with Glass Top",
        price: "$85",
        time: "45 min ago",
        distance: "8.3 mi",
        city: "Vienna",
        image:
            "https://images.unsplash.com/photo-1551298370-9d3d53740c72?q=80&w=800&auto=format&fit=crop",
        category: "Furniture",
    },
    {
        id: "8",
        title: "Garden Tool Set",
        price: "FREE",
        time: "2 hours ago",
        distance: "15.7 mi",
        city: "Sterling",
        image:
            "https://images.unsplash.com/photo-1617624449840-7f4a0ec8d3b9?q=80&w=800&auto=format&fit=crop",
        category: "Garden",
    },
    {
        id: "9",
        title: "Vintage Record Player",
        price: "$120",
        time: "3 hours ago",
        distance: "9.1 mi",
        city: "McLean",
        image:
            "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
    },
    {
        id: "10",
        title: "Yoga Mat and Blocks",
        price: "$15",
        time: "1 hour ago",
        distance: "6.4 mi",
        city: "Arlington",
        image:
            "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop",
        category: "Sports",
        mine: true,
    },
    {
        id: "11",
        title: "Box of Kitchen Utensils",
        price: "FREE",
        time: "5 min ago",
        distance: "10.2 mi",
        city: "Herndon",
        image:
            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop",
        category: "Home",
    },
    {
        id: "12",
        title: "Mountain Bike - Men's",
        price: "$200",
        time: "25 min ago",
        distance: "13.5 mi",
        city: "Leesburg",
        image:
            "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?q=80&w=800&auto=format&fit=crop",
        category: "Sports",
    },
    {
        id: "13",
        title: "Baby Stroller - Excellent Condition",
        price: "$75",
        time: "40 min ago",
        distance: "4.8 mi",
        city: "Tysons",
        image:
            "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop",
        category: "Baby",
    },
    {
        id: "14",
        title: "Standing Desk",
        price: "$150",
        time: "1 hour ago",
        distance: "11.3 mi",
        city: "Centreville",
        image:
            "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=800&auto=format&fit=crop",
        category: "Furniture",
    },
    {
        id: "15",
        title: "Board Game Collection",
        price: "$40",
        time: "2 hours ago",
        distance: "7.9 mi",
        city: "Springfield",
        image:
            "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800&auto=format&fit=crop",
        category: "Toys",
    },
    {
        id: "16",
        title: "Dining Table with 6 Chairs",
        price: "$300",
        time: "4 hours ago",
        distance: "16.2 mi",
        city: "Manassas",
        image:
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800&auto=format&fit=crop",
        category: "Furniture",
    },
    {
        id: "17",
        title: "Electric Grill",
        price: "$60",
        time: "50 min ago",
        distance: "8.7 mi",
        city: "Burke",
        image:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
        category: "Appliances",
    },
    {
        id: "18",
        title: "Textbooks - College Math",
        price: "FREE",
        time: "15 min ago",
        distance: "5.5 mi",
        city: "Fairfax",
        image:
            "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
        category: "Books",
        mine: true,
    },
    {
        id: "19",
        title: "Floor Mirror - Full Length",
        price: "$35",
        time: "3 hours ago",
        distance: "12.8 mi",
        city: "Chantilly",
        image:
            "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop",
        category: "Home",
    },
    {
        id: "20",
        title: "PlayStation 4 with Games",
        price: "$180",
        time: "6 hours ago",
        distance: "14.1 mi",
        city: "Alexandria",
        image:
            "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=800&auto=format&fit=crop",
        category: "Electronics",
    },
];
export default function MarketPage() {
    const [tab, setTab] = useState<"all" | "mine">("all");
    const [category, setCategory] =
        useState<(typeof CATEGORIES)[number]>("All categories");

    const listings = useMemo(() => {
        let arr = DATA;
        if (tab === "mine") arr = arr.filter((l) => l.mine);
        if (category !== "All categories")
            arr = arr.filter((l) => l.category === category);
        return arr;
    }, [tab, category]);

    return (
        <section className="space-y-4">
            {/* Tabs */}
            <div className="border-b border-slate-200 pb-3">
                {/* Tabs */}
                <div className="flex items-center gap-6">
                    <button
                        className={`-mb-px pb-3 text-sm transition-colors ${tab === "all"
                                ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                        onClick={() => setTab("all")}
                    >
                        All listings
                    </button>

                    <button
                        className={`-mb-px pb-3 text-sm transition-colors ${tab === "mine"
                                ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                                : "text-slate-600 hover:text-slate-800"
                            }`}
                        onClick={() => setTab("mine")}
                    >
                        Your listings
                    </button>
                </div>

                {/* Category filter BELOW buttons */}
                <div className="mt-4 flex flex-col gap-2">
                    <label
                        htmlFor="category"
                        className="text-xs font-medium text-slate-500 uppercase tracking-wide"
                    >
                        Filter by category
                    </label>

                    <div className="relative w-64">
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-800 shadow-sm transition-all focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                            aria-label="Categories"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        />
                    </div>
                </div>
            </div>


            {/* Horizontal scroller */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 ">
        {listings.map((l) => (
          <MarketCard key={l.id} listing={l} />
        ))}
      </div>
        </section>
    );
}
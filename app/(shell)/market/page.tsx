"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getProductsByCategory } from "@/repositories/MarketplaceRepository";

// API shape
type ApiProduct = {
  id: number | string;
  name: string;
  description?: string;
  category: string;
  condition?: string;
  price: number;
  available?: boolean;
  images?: string[];
  location?: string;
  createdAt?: string;
  userId?: number | string;
  username?: string;
  ownerContact?: string;
  profilePicture?: string;
};

// Keep Listing to match original card props
type Listing = {
  id: string;
  title: string;
  price: string;        // "FREE" | "Rs 175"
  time: string;         // relative time
  distance: string;     // not in API -> ""
  city: string;         // derived from location
  image: string;        // first image or placeholder
  mine?: boolean;       // optional (when you have current user id)
  category: string;
  raw: ApiProduct;      // full API row for detail page
};

const CATEGORIES = [
  "All categories",
  "ELECTRONIC",
  "COMPUTER",
  "FURNITURE",
  "FOOD",
  "FASHION",
  "SPORTS",
  "ART",
  "BOOKS",
  "HOME & GARDEN",
] as const;


// helpers
function relativeTimeFromISO(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [label: string, sec: number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [label, sec] of units) {
    const v = Math.floor(diffSec / sec);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function formatPrice(n?: number) {
  if (!n || n <= 0) return "FREE";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "NPR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `Rs ${n}`;
  }
}

function firstImage(arr?: string[]) {
  const src = Array.isArray(arr) && arr.length > 0 ? arr[0] : "";
  return src || "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
}

function cityFromLocation(loc?: string) {
  if (!loc) return "";
  // Take first segment before comma as a compact city label
  return loc.split(",")[0]?.trim() || "";
}

function mapApiToListing(p: ApiProduct): Listing {
  return {
    id: String(p.id),
    title: p.name ?? "Untitled",
    price: formatPrice(p.price),
    time: relativeTimeFromISO(p.createdAt),
    distance: "", // API has no distance
    city: cityFromLocation(p.location),
    image: firstImage(p.images),
    category: p.category ?? "",
    // Optional mine flag if you have current user id available:
    // mine: currentUserId && String(p.userId) === String(currentUserId),
    mine: false,
    raw: p,
  };
}

function MarketCard({ listing }: { listing: Listing }) {
  const { id, title, price, time, distance, city, image } = listing;

  const handleClick = () => {
    try {
      const key = `market:product`;
      localStorage.setItem(key, JSON.stringify(listing.raw)); // save full API row
      // localStorage.setItem("market:lastSelectedId", String(id));
    } catch {}
  };

  // Build meta row like original, but skip empty parts (distance may be empty)
  const meta = [time, distance, city].filter(Boolean).join(" • ");

  return (
    <Link
      href={{ pathname: `/market/${id}`, query: { hide: "true" } }}
      onClick={handleClick}
      className="snap-start block shrink-0 rounded-2xl bg-white transition"
    >
      <div className="p-2">
        <div className="overflow-hidden rounded-xl">
          <img
            src={image}
            alt={title}
            className="h-[170px] w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
            }}
          />
        </div>

        <div className="mt-2 space-y-0.5 px-1 pb-2">
          <div className="text-[13px] font-semibold tracking-tight text-slate-900">
            {price.toUpperCase()}
          </div>
          <div className="truncate text-[15px] text-slate-800">{title}</div>
          {meta && <div className="text-[12px] text-slate-500">{meta}</div>}
        </div>
      </div>
    </Link>
  );
}

export default function MarketPage() {
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All categories");
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Replace with your signed-in user id if you want "Your listings" to filter
  const currentUserId: string | null = null;

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiCategory = category === "All categories" ? "" : category;
        const res = await getProductsByCategory(apiCategory as any);
        const rows: ApiProduct[] = Array.isArray(res?.data) ? res.data : [];
        const mapped = rows.map(mapApiToListing);
        if (!ignore) setItems(mapped);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load products");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => {
      ignore = true;
    };
  }, [category]);

  const listings = useMemo(() => {
    let arr = items;
    if (tab === "mine" && currentUserId) {
      arr = arr.filter((l) => String(l.raw.userId ?? "") === currentUserId);
    }
    if (category !== "All categories") {
      arr = arr.filter((l) => l.category?.toLowerCase() === category.toLowerCase());
    }
    return arr;
  }, [tab, category, items, currentUserId]);

  return (
    <section className="space-y-4">
      {/* Tabs */}
      <div className="border-b border-slate-200 pb-3">
        
        {/* Category filter */}
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

      {/* States */}
      {loading && <div className="text-sm text-slate-600">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="text-sm text-slate-500">No products found.</div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {listings.map((l) => (
          <MarketCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
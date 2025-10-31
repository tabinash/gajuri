"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getProductsByCategory } from "@/repositories/MarketplaceRepository";
import { relativeTimeFromISO, formatPrice, firstImage, cityFromLocation } from "@/utils";

// Category options
const CATEGORIES = [
  "All categories",
  "ELECTRONIC",
  "VEHICLES",
  "COMPUTER",
  "FURNITURE",
  "FASHION",
  "BEAUTY",
];

function mapApiToListing(p) {
  return {
    id: String(p.id),
    title: p.name ?? "Untitled",
    price: formatPrice(p.price),
    time: relativeTimeFromISO(p.createdAt),
    distance: "",
    city: cityFromLocation(p.location),
    image: firstImage(p.images),
    category: p.category ?? "",
    mine: false,
    raw: p,
  };
}

function MarketCard({ listing }) {
  const { id, title, price, time, distance, city, image } = listing;

  const handleClick = () => {
    try {
      const key = `market:product`;
      localStorage.setItem(key, JSON.stringify(listing.raw));
    } catch {}
  };

  const meta = [time, distance, city].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/m/market/${id}`}
      onClick={handleClick}
      className="block active:opacity-75 transition-opacity"
    >
      <div className="overflow-hidden rounded-lg bg-white border border-slate-200">
        <img
          src={image}
          alt={title}
          className="h-44 w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
          }}
        />

        <div className="p-3 space-y-1">
          <div className="text-base font-bold text-slate-900">
            {price}
          </div>
          <div className="line-clamp-2 text-sm text-slate-800 leading-snug">{title}</div>
          {meta && <div className="text-xs text-slate-500">{meta}</div>}
        </div>
      </div>
    </Link>
  );
}

function MarketCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg bg-white border border-slate-200 animate-pulse">
      <div className="h-44 w-full bg-slate-200" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-20 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("All categories");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentUserId = null;

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        const apiCategory = category === "All categories" ? "" : category;
        const res = await getProductsByCategory(apiCategory);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped = rows.map(mapApiToListing);
        if (!ignore) setItems(mapped);
      } catch (e) {
        // Silently handle error - will show "No items found" instead
        if (!ignore) setItems([]);
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
      arr = arr.filter(
        (l) => l.category?.toLowerCase() === category.toLowerCase()
      );
    }
    return arr;
  }, [tab, category, items, currentUserId]);

  return (
    <section>
      {/* Filter Section - Compact for mobile */}
      <div className="bg-white border-b border-slate-200  py-3">
        <div className="relative">
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-base text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            aria-label="Filter by category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={20}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 p-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MarketCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && listings.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-base font-medium text-slate-900">No items found</p>
          <p className="text-sm mt-1 text-slate-500">
            {category !== "All categories"
              ? `Try selecting a different category`
              : `Check back later for new listings!`}
          </p>
        </div>
      )}

      {/* Products Grid - 2 columns for mobile */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-2 gap-3 p-1">
          {listings.map((l) => (
            <MarketCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

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

type Detail = {
  id: string;
  title: string;
  description: string;
  price: string;
  time: string;
  images: { src: string; alt?: string }[];
  category?: string;
  condition?: string;
  available?: boolean;
  location?: string;
  seller: {
    id?: string;
    name?: string;
    avatar?: string;
    contact?: string;
  };
  reactions?: number;
  commentsCount?: number;
};

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

function toDetail(p: ApiProduct): Detail {
  return {
    id: String(p.id),
    title: p.name ?? "Untitled",
    description: p.description || "",
    price: formatPrice(p.price),
    time: relativeTimeFromISO(p.createdAt),
    images: (Array.isArray(p.images) ? p.images : []).map((src, i) => ({
      src,
      alt: `image ${i + 1}`,
    })),
    category: p.category,
    condition: p.condition,
    available: p.available,
    location: p.location,
    seller: {
      id: p.userId ? String(p.userId) : undefined,
      name: p.username,
      avatar: p.profilePicture || "https://via.placeholder.com/80/EEE/94A3B8?text=User",
      contact: p.ownerContact,
    },
    reactions: 0,
    commentsCount: 0,
  };
}

export default function MarketItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [item, setItem] = useState<Detail | null>(null);

  useEffect(() => {
    try {
      const key = `market:product`;
      const json = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (json) {
        const api: ApiProduct = JSON.parse(json);
        setItem(toDetail(api));
      } else {
        const lastId = typeof window !== "undefined" ? localStorage.getItem("market:lastSelectedId") : null;
        if (lastId) {
          const alt = localStorage.getItem(`market:product:${lastId}`);
          if (alt) {
            const api: ApiProduct = JSON.parse(alt);
            setItem(toDetail(api));
          }
        }
      }
    } catch {
      setItem(null);
    }
  }, [params.id]);

  const [idx, setIdx] = useState(0);
  const count = item?.images.length ?? 0;
  const hasImages = count > 0;
  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  const [expanded, setExpanded] = useState(false);
  const short = (item?.description?.length ?? 0) > 180 && !expanded;

  const [msg, setMsg] = useState("Hi, is this still available?");
  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    console.log("Message to seller:", msg.trim());
    setMsg("Hi, is this still available?");
  };

  if (!item) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No product data found. Please open this item from the Market page.
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-12 gap-4 ">
      {/* Back button */}
      <div className="col-span-12 mb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Left: media */}
      <div className="col-span-12 lg:col-span-7">
        <div className="relative overflow-hidden rounded-3xl bg-black">
          <div className="flex items-center" style={{ height: 520 }}>
            {!hasImages ? (
              <div className="grid h-full w-full place-items-center text-white/70">No image</div>
            ) : (
              <div
                className="flex h-full w-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${idx * 100}%)` }}
              >
                {item.images.map((img, i) => (
                  <div key={i} className="flex h-full w-full shrink-0 items-center justify-center">
                    <img
                      src={img.src}
                      alt={img.alt ?? `image ${i + 1}`}
                      className="max-h-[520px] w-auto object-contain"
                      draggable={false}
                      // onError={(e) => {
                      //   e.currentTarget.src = "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
                      // }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasImages && count > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right: details */}
      <div className="col-span-12 lg:col-span-5 space-y-4">
        {/* Details card */}
        <div className="rounded-3xl border border-slate-200 bg-white">
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-semibold text-slate-900 leading-6">{item.title}</h1>
              
            </div>

            <div className="mt-1 text-base font-semibold text-emerald-700">{item.price}</div>

            {/* Chips */}
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {item.category && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.category}</span>}
              {item.condition && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.condition}</span>}
              {item.available !== undefined && (
                <span className={`rounded-full px-2 py-0.5 ${item.available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                  {item.available ? "Available" : "Unavailable"}
                </span>
              )}
              {item.location && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.location}</span>}
            </div>

            {/* Seller */}
{/* Seller */}
<div className="mt-4 flex items-start gap-3">
  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
    {item.seller.name ? item.seller.name.charAt(0).toUpperCase() : "U"}
  </div>
  <div className="min-w-0">
    <div className="text-sm font-semibold text-slate-900">{item.seller.name}</div>
    {item.seller.contact && (
      <div className="text-xs text-slate-600 break-all">{item.seller.contact}</div>
    )}
  </div>
</div>


            {/* Description */}
            <div className="mt-4 text-[15px] leading-6 text-slate-800">
              {short ? (
                <>
                  {item.description.slice(0, 180)}…
                  <button className="ml-1 text-slate-600 underline" onClick={() => setExpanded(true)}>
                    see more
                  </button>
                </>
              ) : (
                item.description
              )}
            </div>

           
          </div>
        </div>

        {/* Message card */}
        <Link
          href={`/messages?userId=${item.seller.id}`}
          className="inline-block rounded-3xl border border-slate-200 bg-blue-500 px-5 py-3 hover:bg-blue-600 transition-colors"
        >
          <span className="text-sm font-semibold text-white">
            Send Message
          </span>
        </Link>

      </div>
    </section >
  );
}

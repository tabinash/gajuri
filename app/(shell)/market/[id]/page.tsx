"use client";

import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Bookmark, MoreHorizontal, Send } from "lucide-react";

type Listing = {
  id: string;
  title: string;
  price: string; // "FREE", "$175", etc.
  images: { src: string; alt?: string }[];
  seller: {
    name: string;
    avatar: string;
    location: string; // e.g., "Fox Lake"
    distance: string; // e.g., "6.8 mi"
  };
  description: string;
  time: string; // e.g., "12 min ago"
  reactions?: number;
  commentsCount?: number;
};

const MOCK: Record<string, Listing> = {
  "1": {
    id: "1",
    title: "Red Leather Sofa and recliner chair with ottoman",
    price: "FREE",
    images: [
      { src: "https://images.unsplash.com/photo-1616596872535-4b3e29f57a7d?q=80&w=1600&auto=format&fit=crop", alt: "Red leather sofa" },
      { src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop", alt: "Matching recliner" },
    ],
    seller: {
      name: "Jessica Ness",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
      location: "Fox Lake",
      distance: "6.8 mi",
    },
    description:
      "Comfortable red leather sofa in fine condition. Didn’t need them after a move so they’ve been in storage. The pieces need a good cleaning and some light conditioning, but no rips. Pickup only.",
    time: "12 min ago",
    reactions: 3,
    commentsCount: 24,
  },
};

export default function MarketItemPage({ params }: { params: { id: string } }) {
  const item = useMemo<Listing>(() => {
    return MOCK[params.id] ?? MOCK["1"];
  }, [params.id]);

  const [idx, setIdx] = useState(0);
  const count = item.images.length;
  const hasImages = count > 0;
  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  const [expanded, setExpanded] = useState(false);
  const short = item.description.length > 180 && !expanded;

  const [msg, setMsg] = useState("Hi, is this still available?");
  const send = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!msg.trim()) return;
    console.log("Message to seller:", msg.trim());
    setMsg("Hi, is this still available?");
  };

  return (
    <section className="grid grid-cols-12 gap-4 p-8 ">
      {/* Left: media */}
      <div className="col-span-12 lg:col-span-7">
        <div className="relative overflow-hidden rounded-3xl bg-black">
          <div className="flex items-center" style={{ height: 520 }}>
            {!hasImages ? (
              <div className="grid h-full w-full place-items-center text-white/70">
                No image
              </div>
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
              <h1 className="text-xl font-semibold text-slate-900 leading-6">
                {item.title}
              </h1>
              <div className="flex items-center gap-1">
                <button aria-label="Save" className="rounded-full p-2 text-slate-600">
                  <Bookmark size={18} />
                </button>
                <button aria-label="More" className="rounded-full p-2 text-slate-600">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>

            <div className="mt-1 text-base font-semibold text-emerald-700">{item.price}</div>

            {/* Seller */}
            <div className="mt-4 flex items-start gap-3">
              <img
                src={item.seller.avatar}
                alt={`${item.seller.name} avatar`}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {item.seller.name}
                </div>
                <div className="text-xs text-slate-600">
                  {item.seller.location} • {item.seller.distance}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 text-[15px] leading-6 text-slate-800">
              {short ? (
                <>
                  {item.description.slice(0, 180)}…
                  <button
                    className="ml-1 text-slate-600 underline"
                    onClick={() => setExpanded(true)}
                  >
                    see more
                  </button>
                </>
              ) : (
                item.description
              )}
            </div>

            {/* Meta row */}
            <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
              <span>{item.time}</span>
              <div className="flex items-center gap-4">
                <span>{item.reactions ?? 0} reactions</span>
                <span>{item.commentsCount ?? 0} comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-sm font-semibold text-slate-900">
            Send {item.seller.name} a message
          </div>
          <form onSubmit={send} className="mt-3 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 py-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              placeholder="Hi, is this still available?"
            />
            <button
              type="submit"
              aria-label="Send"
              className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-white"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
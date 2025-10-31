"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { getProductById, markProductSold } from "@/repositories/MarketplaceRepository";
import { conversationRepository } from "@/repositories/conversationRepository";
import { useCurrentUser, useCarousel } from "@/hooks";

export default function MarketItemPage({ params }) {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const { user: userData } = useCurrentUser();

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await getProductById(params.id);
        console.log("🚀 Fetched product data:", response.data);
        setItem(toDetail(response.data));
      } catch (err) {
        console.error("Failed to load product:", err);
        setItem(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [params.id]);

  const [idx, setIdx] = useState(0);
  const count = item?.images?.length || 0;
  const hasImages = count > 0;
  const prev = () => setIdx((i) => (i - 1 + count) % count);
  const next = () => setIdx((i) => (i + 1) % count);

  const [expanded, setExpanded] = useState(false);
  const short = (item?.description?.length || 0) > 180 && !expanded;

  function relativeTimeFromISO(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    const units = [
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

  function formatPrice(n) {
    if (!n || n <= 0) return "FREE";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "NPR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `Rs ${n}`;
    }
  }

  function toDetail(p) {
    return {
      id: String(p.id),
      title: p.name || "Untitled",
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

  const handleMarkAsSold = async () => {
    if (!item) return;
    setIsMarking(true);
    setStatusMessage(null);
    try {
      await markProductSold(item.id);
      console.log("Product marked as sold");
      setItem({ ...item, available: false });
      setStatusMessage({ type: "success", text: "Product marked as sold successfully!" });
    } catch (err) {
      console.error("Failed to mark product as sold:", err);
      setStatusMessage({ type: "error", text: "Failed to mark product as sold. Please try again." });
    } finally {
      setIsMarking(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !item || sendingMessage) return;

    setSendingMessage(true);
    setMessageStatus(null);
    try {
      const productInfo = ` Product: ${item.title}\n Price: ${item.price}\n Location: ${item.location || 'Not specified'}\n\n`;
      const fullMessage =  trimmed + "\n\n" + productInfo;

      const response = await conversationRepository.sendMessage({
        receiverId: Number(item.seller.id),
        content: fullMessage,
      });

      if (!response.success) throw new Error(response.message || "Failed to send message");

      setMessage("");
      setMessageStatus({ type: "success", text: "Message sent successfully!" });
      setTimeout(() => setMessageStatus(null), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageStatus({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setSendingMessage(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <section className="grid grid-cols-12 gap-4">
        <div className="col-span-12 mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="col-span-12 lg:col-span-7 animate-pulse">
          <div className="relative overflow-hidden rounded-3xl bg-slate-200" style={{ height: 520 }} />
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 w-3/4 rounded bg-slate-200" />
              <div className="h-5 w-24 rounded bg-slate-200" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded-full bg-slate-200" />
                <div className="h-5 w-20 rounded-full bg-slate-200" />
                <div className="h-5 w-16 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200" />
                  <div className="h-3 w-40 rounded bg-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 animate-pulse">
            <div className="h-10 w-full rounded-full bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (!item) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No product data found. Please open this item from the Market page.
        </div>
      </section>
    );
  }

  const isOwner = userData && userData.id && item.seller.id && String(userData.id) === String(item.seller.id);

  return (
    <section className="w-full">
      <div className="mb-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-7">
          <div className="relative overflow-hidden rounded-3xl bg-black">
            <div className="flex items-center" style={{ height: 520 }}>
              {!hasImages ? (
                <div className="grid h-full w-full place-items-center text-white/70">No image</div>
              ) : (
                <div className="flex h-full w-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
                  {item.images.map((img, i) => (
                    <div key={i} className="flex h-full w-full shrink-0 items-center justify-center">
                      <img src={img.src} alt={img.alt} className="max-h-[520px] w-auto object-contain" draggable={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasImages && count > 1 && (
              <>
                <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-semibold text-slate-900 leading-6">{item.title}</h1>
              </div>
              <div className="mt-1 text-base font-semibold text-gray-700">{item.price}</div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {item.category && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.category}</span>}
                {item.condition && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.condition}</span>}
                {item.available !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 ${item.available ? "bg-[#1B74E4] text-white" : "bg-slate-100"}`}>
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                )}
                {item.location && <span className="rounded-full bg-slate-100 px-2 py-0.5">{item.location}</span>}
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {item.seller.name ? item.seller.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-900">{item.seller.name}</div>
                  {item.seller.contact && <div className="text-xs text-slate-600 break-all">{item.seller.contact}</div>}
                </div>
              </div>

              <div className="mt-4 text-[15px] leading-6 text-slate-800">
                {short ? (
                  <>
                    {item.description.slice(0, 180)}…
                    <button className="ml-1 text-slate-600 underline" onClick={() => setExpanded(true)}>see more</button>
                  </>
                ) : (
                  item.description
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            {isOwner ? (
              <div>
                <button
                  onClick={handleMarkAsSold}
                  disabled={isMarking || !item.available}
                  className={`w-full rounded-full px-5 py-3 text-sm font-semibold transition-colors ${!item.available ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
                >
                  {isMarking ? "Marking..." : !item.available ? "Already Sold" : "Mark as Sold"}
                </button>
                {statusMessage && (
                  <div className={`mt-3 text-sm ${statusMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {statusMessage.text}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-3 text-sm font-semibold text-slate-900">Contact Seller</div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !message.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? "Sending..." : <><Send size={16} /> Send</>}
                  </button>
                </form>

                {messageStatus && (
                  <div className={`mt-2 text-xs ${messageStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {messageStatus.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
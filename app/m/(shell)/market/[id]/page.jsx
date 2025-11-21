"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { getProductById, markProductSold } from "@/repositories/MarketplaceRepository";
import { conversationRepository } from "@/repositories/conversationRepository";
import { useCurrentUser, useImageViewer } from "@/hooks";
import ImageViewer from "@/components-mobile/ImageViewer";

export default function MarketItemPage({ params }) {
  const router = useRouter();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const { user: userData, userId } = useCurrentUser();
  const imageViewer = useImageViewer();

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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Item Details</h1>
        </div>

        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-80 w-full bg-slate-200" />
          <div className="p-4 space-y-4">
            <div className="h-7 w-3/4 rounded bg-slate-200" />
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-slate-200" />
              <div className="h-6 w-24 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-3 w-40 rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-3/4 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Item Details</h1>
        </div>
        <div className="p-8 text-center text-slate-500">
          <p>Item not found</p>
        </div>
      </div>
    );
  }

  const isOwner = userData && userData.id && item.seller.id && String(userData.id) === String(item.seller.id);

  return (
    <div className="flex min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Item Details</h1>
      </div>

      {/* Image Carousel - Full width */}
      <div className="relative h-80 bg-black overflow-hidden">
        {!hasImages ? (
          <div className="grid h-full w-full place-items-center text-white/70">No image</div>
        ) : (
          <div className="flex h-full w-full transition-transform duration-300 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {item.images.map((img, i) => (
              <div key={i} className="flex h-full w-full shrink-0 items-center justify-center">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="max-h-80 w-full object-contain cursor-pointer"
                  draggable={false}
                  onClick={() => imageViewer.open(item.images, i)}
                />
              </div>
            ))}
          </div>
        )}

        {hasImages && count > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} aria-label="Next" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {item.images.map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Price & Title */}
        <div className="text-2xl font-bold text-slate-900">{item.price}</div>
        <h2 className="mt-1 text-lg text-slate-900 leading-snug">{item.title}</h2>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {item.category && <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{item.category}</span>}
          {item.condition && <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{item.condition}</span>}
          {item.available !== undefined && (
            <span className={`rounded-full px-3 py-1 font-medium ${item.available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
              {item.available ? "Available" : "Sold"}
            </span>
          )}
        </div>

        {/* Seller Info */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-base font-semibold text-slate-700">
            {item.seller.name ? item.seller.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div className="text-base font-semibold text-slate-900">{item.seller.name}</div>
            {item.location && <div className="text-sm text-slate-600">{item.location}</div>}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">Description</h3>
          <div className="mt-2 text-base leading-relaxed text-slate-700">
            {short ? (
              <>
                {item.description.slice(0, 180)}…
                <button className="ml-1 text-blue-600" onClick={() => setExpanded(true)}>see more</button>
              </>
            ) : (
              item.description || "No description provided."
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
        {isOwner ? (
          <div>
            <button
              onClick={handleMarkAsSold}
              disabled={isMarking || !item.available}
              className={`w-full rounded-lg px-6 py-3 text-base font-semibold transition-colors ${!item.available ? "bg-slate-100 text-slate-400" : "bg-red-600 text-white active:bg-red-700"}`}
            >
              {isMarking ? "Marking..." : !item.available ? "Already Sold" : "Mark as Sold"}
            </button>
            {statusMessage && (
              <div className={`mt-2 text-sm text-center ${statusMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {statusMessage.text}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Contact Seller</div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendingMessage}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendingMessage || !message.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {sendingMessage ? "Sending..." : <><Send size={16} /> Send</>}
              </button>
            </form>
            {messageStatus && (
              <div className={`mt-2 text-xs text-center ${messageStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {messageStatus.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Image Viewer */}
      <ImageViewer
        isOpen={imageViewer.isOpen}
        images={imageViewer.images}
        currentIndex={imageViewer.currentIndex}
        onClose={imageViewer.close}
        onNext={imageViewer.next}
        onPrev={imageViewer.prev}
        onGoTo={imageViewer.goTo}
      />
    </div>
  );
}
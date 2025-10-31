"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProductByUserId } from "@/repositories/MarketplaceRepository";
import { relativeTimeFromISO, formatPrice, firstImage, cityFromLocation } from "@/utils";
import { useCurrentUser } from "@/hooks";

function mapApiToProduct(p) {
  return {
    id: String(p.id),
    title: p.name ?? "Untitled",
    price: formatPrice(p.price),
    time: relativeTimeFromISO(p.createdAt),
    city: cityFromLocation(p.location),
    image: firstImage(p.images),
    raw: p,
  };
}

function ProductCard({ product }) {
  const handleClick = () => {
    try {
      localStorage.setItem(`market:product`, JSON.stringify(product.raw));
    } catch {}
  };

  const meta = [product.time, product.city].filter(Boolean).join(" • ");

  return (
    <Link
      href={`/m/market/${product.id}`}
      onClick={handleClick}
      className="block active:opacity-75 transition-opacity"
    >
      <div className="overflow-hidden rounded-lg bg-white border border-slate-200">
        <img
          src={product.image}
          alt={product.title}
          className="h-44 w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
          }}
        />
        <div className="p-3 space-y-1">
          <div className="text-base font-bold text-slate-900">{product.price}</div>
          <div className="line-clamp-2 text-sm text-slate-800 leading-snug">
            {product.title}
          </div>
          {meta && <div className="text-xs text-slate-500">{meta}</div>}
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
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

export default function YourItemsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userId } = useCurrentUser();

  useEffect(() => {
    if (!userId) return;

    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getProductByUserId(userId);
        const rows = Array.isArray(res?.data) ? res.data : [];
        const mapped = rows.map(mapApiToProduct);

        if (!ignore) setProducts(mapped);
      } catch (e) {
        if (!ignore) setError(e?.message || "Failed to load products");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [userId]);

  return (
    <section>
      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 p-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="py-6 text-center">
          <p className="text-base font-medium text-red-600">Failed to load your items</p>
          <p className="text-sm mt-1 text-slate-500">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="py-6 text-center">
          <p className="text-base font-medium text-slate-900">No items yet</p>
          <p className="text-sm mt-1 text-slate-500">
            Your listed items will appear here
          </p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 gap-3 p-0 mt-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

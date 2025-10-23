"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProductByUserId } from "@/repositories/MarketplaceRepository";

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

// Simplified mapped product type
type ProductItem = {
  id: string;
  title: string;
  price: string;
  time: string;
  city: string;
  image: string;
  raw: ApiProduct;
};

// Helper functions
function formatTime(iso?: string) {
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
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rs ${n}`;
  }
}

function getFirstImage(arr?: string[]) {
  const src = Array.isArray(arr) && arr.length > 0 ? arr[0] : "";
  return src || "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
}

function getCity(loc?: string) {
  if (!loc) return "";
  return loc.split(",")[0]?.trim() || "";
}

function mapApiToProduct(p: ApiProduct): ProductItem {
  return {
    id: String(p.id),
    title: p.name ?? "Untitled",
    price: formatPrice(p.price),
    time: formatTime(p.createdAt),
    city: getCity(p.location),
    image: getFirstImage(p.images),
    raw: p,
  };
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Link
      href={{ pathname: `/market/${product.id}`, query: { hide: "true" } }}
      className="block  bg-white  transition hover:shadow-md"
    >
      <div className="overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.title}
          className="h-[170px] w-full object-cover"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/400x300/EEE/94A3B8?text=Item";
          }}
        />
      </div>

      <div className="mt-2 space-y-0.5 px-1 pb-2">
        <div className="text-sm font-semibold tracking-tight text-slate-900">
          {product.price.toUpperCase()}
        </div>
        <div className="truncate text-base text-slate-800">
          {product.title}
        </div>
        <div className="text-sm text-slate-500">
          {[product.time, product.city].filter(Boolean).join(" • ")}
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-2 shadow-sm animate-pulse">
      <div className="overflow-hidden rounded-xl">
        <div className="h-[170px] w-full bg-slate-200" />
      </div>
      <div className="mt-2 space-y-2 px-1 pb-2">
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: you'll handle this user ID part
  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getProductByUserId(userData?.id);
        const rows: ApiProduct[] = Array.isArray(res?.data) ? res.data : [];
        const mapped = rows.map(mapApiToProduct);

        if (!ignore) setProducts(mapped);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load products");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className="space-y-4">
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      )}
      {error && <div className="text-base text-red-600">{error}</div>}
      {!loading && !error && products.length === 0 && (
        <div className="text-base text-slate-500">No products found.</div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
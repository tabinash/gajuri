"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import PostCard from "../PostCard";
import PostDetailModal from "../PostDetailModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import postRepository from "@/repositories/PostRepository";

// Relative time formatter
function relativeTimeFromISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
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

// Normalize images array from API (strings or objects)
function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images
    .map((img) =>
      typeof img === "string"
        ? { src: img, alt: "image" }
        : { src: img?.url || img?.src || "", alt: img?.alt || "image" }
    )
    .filter((i) => i.src);
}

// Map API post -> PostCard props
function mapApiPostToCard(api) {
  return {
    _id: api?.id ?? crypto.randomUUID?.() ?? Math.random(),
    postType: api?.postType ,
    name: api?.username ?? "Unknown",
    neighborhood: "", // not provided by API
    time: relativeTimeFromISO(api?.createdAt),
    text: api?.content ?? "",
    likes: 0, // not provided by API
    comments: api?.commentCount ?? 0,
    avatar: api?.userProfilePicture ?? "",
    images: normalizeImages(api?.images),
    _raw: api,
  };
}

export default function FeedPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    isError,
    isSuccess,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "nepali"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await postRepository.getNewsAndNoticePosts(pageParam, 12);
      return res.data; // expecting { content, last, number, ... }
    },
    getNextPageParam: (lastPage) =>
      lastPage?.last ? undefined : (lastPage?.number ?? 0) + 1,
  });

  useEffect(() => {
    if (isError) console.error("Error fetching posts:", error);
  }, [isError, error]);

  // Auto load on intersection
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    io.observe(el);
    return () => io.unobserve(el);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const items = useMemo(
    () => (isSuccess ? data.pages.flatMap((p) => p?.content ?? []) : []),
    [isSuccess, data]
  );

  const cards = useMemo(() => items.map(mapApiPostToCard), [items]);

  return (
    <>
      {/* Simple Shimmer Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
            >
              <div className="space-y-4">
                {/* Header shimmer */}
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="h-3 w-24 rounded bg-slate-200" />
                  </div>
                </div>
                
                {/* Content shimmer */}
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-4/6 rounded bg-slate-200" />
                </div>
                
                {/* Action buttons shimmer */}
                <div className="flex items-center gap-6 pt-2">
                  <div className="h-8 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-20 rounded bg-slate-200" />
                  <div className="h-8 w-20 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="text-center text-red-600">
            <p className="font-semibold">Failed to load posts</p>
            <p className="text-sm mt-1">Please try again later</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        {cards.map((p) => (
          <PostCard
          postType={p.postType}
            key={p._id}
            {...p}
            id={p._id}
            onOpen={() => {
              setSelected(p);
              setOpen(true);
            }}
            onComment={() => {
              setSelected(p);
              setOpen(true);
            }}
          />
        ))}

        {isSuccess && cards.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12">
            <div className="text-center text-slate-500">
              <p className="text-lg font-medium">No news or notices yet</p>
              <p className="text-sm mt-1">Check back later for updates!</p>
            </div>
          </div>
        )}

        {/* Sentinel for infinite loading */}
        {isSuccess && hasNextPage && (
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
        )}

        {isFetchingNextPage && (
          <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Loading more posts...
            </div>
          </div>
        )}
      </section>

      <PostDetailModal open={open} onClose={() => setOpen(false)} post={selected} />
    </>
  );
}
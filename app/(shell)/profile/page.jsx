"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import PostCard from "../feed/PostCard";
import PostDetailModal from "../feed/PostDetailModal";
import ProfileHeader from "./ProfileHeader";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import postRepository from "@/repositories/PostRepository";

// --- Utility: relative time ---
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

// --- Normalize images array from API ---
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

// --- Map API post to PostCard props ---
function mapApiPostToCard(api) {
  return {
    _id: api?.id ?? crypto.randomUUID?.() ?? Math.random(),
    userId: api?.userId ?? null,
    name: api?.username ?? "Unknown",
    neighborhood: "",
    time: relativeTimeFromISO(api?.createdAt),
    text: api?.content ?? "",
    likes: api?.viewCount ?? 0,
    comments: api?.commentCount ?? 0,
    avatar: api?.userProfilePicture ?? "",
    images: normalizeImages(api?.images),
    _raw: api,
  };
}

export default function ProfilePostsPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const loadMoreRef = useRef(null);
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  // --- Infinite Query for user posts ---
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
    queryKey: ["posts", "user", userId],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await postRepository.getPostsByUserId(userId, pageParam, 10);
      console.log("Fetched user posts data:", res.data);
      return res.data; // { content, last, number, ... }
    },
    getNextPageParam: (lastPage) =>
      lastPage?.last ? undefined : (lastPage?.number ?? 0) + 1,
    enabled: !!userId,
  });

  // --- Log or handle errors ---
  useEffect(() => {
    if (isError) console.error("Error fetching user posts:", error);
  }, [isError, error]);

  // --- Auto load next page when scrolled ---
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

  // --- Flatten data pages ---
  const items = useMemo(
    () => (isSuccess ? data.pages.flatMap((p) => p?.content ?? []) : []),
    [isSuccess, data]
  );

  // --- Transform API posts to card data ---
  const cards = useMemo(() => items.map(mapApiPostToCard), [items]);

  return (
    <>
      {/* Profile Header */}
      <ProfileHeader userId={userId ?? ""} />

      {/* Posts Section */}
      <section className="space-y-3">
        {isLoading && <div>Loading...</div>}
        {isError && (
          <div className="text-red-600">Failed to load user posts.</div>
        )}

        {cards.map((p) => (
          <PostCard
            key={p._id}
            {...p}
            id={p.userId}
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
          <div className="text-sm text-gray-500">No posts yet.</div>
        )}

        {/* Sentinel for infinite loading */}
        {isSuccess && hasNextPage && (
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
        )}

        {isFetchingNextPage && (
          <div className="py-2 text-center text-sm text-gray-500">
            Loading more...
          </div>
        )}
      </section>

      {/* Post Detail Modal */}
      <PostDetailModal
        open={open}
        onClose={() => setOpen(false)}
        post={selected}
      />
    </>
  );
}

"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import PostCard from "./PostCard";
import PostDetailModal from "./PostDetailModal";
import { useInfiniteQuery } from "@tanstack/react-query";
import postRepository from "@/repositories/PostRepository";
import { relativeTimeFromISO, normalizeImages } from "@/utils";

// Map API post -> PostCard props
function mapApiPostToCard(api) {
  return {
    id: api?.id ?? crypto.randomUUID?.() ?? Math.random(),
    userId: api?.userId ?? null,
    postType: api?.postType ,
    name: api?.username ?? "Unknown",
    neighborhood: "", // not provided by API
    time: relativeTimeFromISO(api?.createdAt),
    text: api?.content ?? "",
    likes: api?.viewCount ?? 0, // not provided by API
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
    queryKey: ["posts", "general"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await postRepository.getGeneralPosts(pageParam, 12);
      console.log("Fetched posts page:",  res);
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
            key={p.id}
            postId={p.id}
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
          <div className="bg-white rounded-2xl border border-slate-200 p-12">
            <div className="text-center text-slate-500">
              <p className="text-lg font-medium">No posts yet</p>
              <p className="text-sm mt-1">Be the first to share something!</p>
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
      

      {/* <PostDetailModal open={open} onClose={() => setOpen(false)} post={selected} /> */}
      {open && selected && (
        <PostDetailModal
          open={open}
          onClose={() => setOpen(false)}
          post={selected}
        />
      )}
    </>
  );
}
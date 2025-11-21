"use client";

import React, { useMemo, useRef, useEffect } from "react";
import PostCard from "./PostCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import postRepository from "@/repositories/PostRepository";
import { relativeTimeFromISO, normalizeImages } from "@/utils";
import { useRouter } from "next/navigation";

// Map API post -> PostCard props
function mapApiPostToCard(api) {
  return {
    id: api?.id ?? crypto.randomUUID?.() ?? Math.random(),
    userId: api?.userId ?? null,
    postType: api?.postType,
    name: api?.username ?? "Unknown",
    neighborhood: "", // not provided by API
    time: relativeTimeFromISO(api?.createdAt),
    text: api?.content ?? "",
    likes: api?.viewCount ?? 0,
    comments: api?.commentCount ?? 0,
    avatar: api?.userProfilePicture ?? "",
    images: normalizeImages(api?.images),
    _raw: api,
  };
}

export default function FeedPage() {
  const loadMoreRef = useRef(null);
  const router = useRouter();

  const handlePostClick = (post) => {
    // Save post data to localStorage
    localStorage.setItem("post data", JSON.stringify(post));
    router.push(`/m/feed/${post.id}`);
  };

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
      return res.data;
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
      { root: null, rootMargin: "400px 0px", threshold: 0 }
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
    <div className="min-h-screen bg-slate-100">
      {/* Loading Skeleton */}
      {isLoading && (
        <div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-b border-slate-200 bg-white p-3 animate-pulse"
            >
              <div className="space-y-3">
                {/* Header shimmer */}
                <div className="flex items-center gap-2.5">
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
                </div>

                {/* Action buttons shimmer */}
                <div className="flex gap-2">
                  <div className="h-11 flex-1 rounded-lg bg-slate-200" />
                  <div className="h-11 flex-1 rounded-lg bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex h-screen items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900">Failed to load posts</p>
            <p className="mt-1 text-sm text-slate-600">Please try again later</p>
          </div>
        </div>
      )}

      {/* Posts Feed */}
      {isSuccess && (
        <>
          {cards.map((p) => (
            <PostCard
              key={p.id}
              postId={p.id}
              {...p}
              id={p.userId}
              onOpen={() => handlePostClick(p)}
              onComment={() => handlePostClick(p)}
            />
          ))}

          {/* Empty State */}
          {cards.length === 0 && (
            <div className="flex h-screen items-center justify-center px-4">
              <div className="text-center">
                <p className="text-base font-medium text-slate-900">No posts yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Be the first to share something!
                </p>
              </div>
            </div>
          )}

          {/* Sentinel for infinite loading */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
          )}

          {/* Loading More */}
          {isFetchingNextPage && (
            <div className="border-t border-slate-200 py-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                Loading more...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

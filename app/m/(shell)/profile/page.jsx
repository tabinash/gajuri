"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import PostCard from "./PostCard";
import ProfileHeader from "./ProfileHeader";
import { useInfiniteQuery } from "@tanstack/react-query";
import postRepository from "@/repositories/PostRepository";
import { relativeTimeFromISO, normalizeImages } from "@/utils";
import { useQueryParam } from "@/hooks";
import { useRouter } from "next/navigation";

// --- Map API post to PostCard props ---
function mapApiPostToCard(api) {
  return {
    id: api?.id ?? crypto.randomUUID?.() ?? Math.random(),
    userId: api?.userId ?? null,
    postType: api?.postType,
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

function ProfilePostsContent() {
  const loadMoreRef = useRef(null);
  const userId = useQueryParam("userId");
  const router = useRouter();

  const handlePostClick = (post) => {
    // Save post data to localStorage
    localStorage.setItem("profile post data", JSON.stringify(post));
    router.push(`/m/profile/post`);
  };

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
    queryKey: ["posts", "user", Number(userId)],
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
      <section>
        {/* Simple Shimmer Loading */}
        {isLoading && (
          <div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-b border-slate-200 bg-white p-4 animate-pulse"
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
          <div className="bg-white border-b border-slate-200 p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Failed to load posts</p>
              <p className="text-sm mt-1">Please try again later</p>
            </div>
          </div>
        )}

        {cards.map((p) => (
          <PostCard
            key={p.id}
            postType={p.postType}
            postId={p.id}
            {...p}
            id={p.userId}
            onOpen={() => handlePostClick(p)}
            onComment={() => handlePostClick(p)}
          />
        ))}

        {isSuccess && cards.length === 0 && (
          <div className="bg-white border-b border-slate-200 p-8">
            <div className="text-center text-slate-500">
              <p className="text-base font-medium">No posts yet</p>
              <p className="text-sm mt-1">This user hasn't shared anything</p>
            </div>
          </div>
        )}

        {/* Sentinel for infinite loading */}
        {isSuccess && hasNextPage && (
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
        )}

        {isFetchingNextPage && (
          <div className="border-t border-slate-200 py-4 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <div className="h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Loading more posts...
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default function ProfilePostsPage() {
  return (
    <Suspense
      fallback={
        <div>
          {/* Profile Header Skeleton */}
          <div className="bg-white border-b border-slate-200 p-4 animate-pulse">
            <div className="h-32 w-full bg-slate-200 -mx-4" />
            <div className="mt-12 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Posts Skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border-b border-slate-200 p-4 animate-pulse"
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
      }s
    >
      <ProfilePostsContent />
    </Suspense>
  );
}
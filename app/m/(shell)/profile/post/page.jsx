"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  Globe2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { commentRepository } from "@/repositories/commentRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useCarousel } from "@/hooks";

// Comment Input Component
const CommentInput = React.memo(function CommentInput({
  avatar,
  value,
  disabled,
  submitting,
  onChange,
  onSubmit,
}) {
  const fallback =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop";

  const isDisabled = Boolean(disabled || submitting);
  const canSend = Boolean(value.trim()) && !isDisabled;

  return (
    <div className="flex gap-2.5">
      <img
        src={avatar || fallback}
        alt="Your avatar"
        className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
        onError={(e) => {
          e.currentTarget.src = fallback;
        }}
      />
      <div className="flex flex-1 gap-2">
        <input
          type="text"
          placeholder={submitting ? "Posting..." : "Write a comment..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSubmit();
            }
          }}
          disabled={isDisabled}
          aria-busy={submitting}
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none disabled:opacity-60"
        />
        <button
          onClick={onSubmit}
          disabled={!canSend}
          className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send comment"
          title="Send"
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
});

export default function ProfilePostDetailPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);

  const { user: userData } = useCurrentUser();
  const myAvatar = userData?.profilePhotoUrl;

  // Load post from localStorage
  useEffect(() => {
    try {
      const savedPost = localStorage.getItem("profile post data");
      if (savedPost) {
        const parsedPost = JSON.parse(savedPost);
        setPost(parsedPost);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to load post from localStorage:", error);
      setLoading(false);
    }
  }, []);

  const loadComments = useCallback(async () => {
    if (!post?.id) return;
    try {
      setLoadingComments(true);
      const response = await commentRepository.getComments(post.id);
      const rows = Array.isArray(response?.data) ? response.data : [];
      setComments(
        rows.map((c) => ({
          id: c.id,
          author: c.username,
          avatar: c.userProfilePicture,
          text: c.content,
          time: c.timeAgo || "",
        }))
      );
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, [post?.id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content || !post?.id || sending) return;
    try {
      setSending(true);
      await commentRepository.addComment({ postId: post.id, content });
      setCommentText("");
      await loadComments();
      queryClient.invalidateQueries({ queryKey: ["posts", "general"] });
      if (post?.userId) {
        queryClient.invalidateQueries({ queryKey: ["posts", "user", post.userId] });
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSending(false);
    }
  };

  const hasImages = !!post?.images?.length;
  const images = post?.images || [];
  const { index, prev, next } = useCarousel(images.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Post</h1>
        </div>

        {/* Loading skeleton */}
        <div className="p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-3 w-24 rounded bg-slate-200" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => router.back()}
            className="rounded-full p-1 hover:bg-slate-100"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Post</h1>
        </div>
        <div className="flex items-center justify-center p-8">
          <p className="text-slate-500">Post not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="rounded-full p-1 hover:bg-slate-100"
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Post</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Post Content */}
        <div className="border-b border-slate-200 px-4 py-3">
          {/* Author */}
          <div className="flex items-start gap-3">
            <img
              src={post.avatar}
              alt={`${post.name} avatar`}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-slate-900">{post.name}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                {post.neighborhood && (
                  <>
                    <span className="truncate">{post.neighborhood}</span>
                    <span>•</span>
                  </>
                )}
                <span>{post.time}</span>
                <span>•</span>
                <Globe2 size={14} className="text-slate-400" aria-hidden="true" />
              </div>
            </div>

            {post.postType !== "GENERAL" && (
              <span
                className={[
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  post.postType === "LOST_AND_FOUND"
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : post.postType === "ALERT"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : post.postType === "NOTICE"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "",
                ].join(" ")}
              >
                {post.postType.replaceAll("_", " ")}
              </span>
            )}
          </div>

          {/* Post Text */}
          <p className="mt-3 whitespace-pre-wrap text-base leading-normal text-slate-800">
            {post.text}
          </p>

          {/* Images */}
          {hasImages && (
            <div className="relative -mx-4 mt-3 overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.src}
                    alt={img.alt ?? `Image ${i + 1}`}
                    className="h-[320px] w-full shrink-0 object-cover"
                  />
                ))}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === index ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
              <Eye size={18} />
              <span>{post.likes}</span>
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
              <MessageCircle size={18} />
              <span aria-live="polite" className="min-w-[1ch]">
                {loadingComments ? (
                  <Loader2 size={14} className="ml-0.5 inline animate-spin text-slate-500" />
                ) : (
                  comments.length
                )}
              </span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-4">
          <h3 className="text-base font-semibold text-slate-900">Comments</h3>

          <div className="mt-3 space-y-3">
            {loadingComments ? (
              <>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex gap-2.5 animate-pulse">
                    <div className="h-9 w-9 flex-shrink-0 rounded-full bg-slate-200" />
                    <div className="min-w-0 flex-1">
                      <div className="rounded-2xl bg-slate-100 px-3 py-2">
                        <div className="h-3 w-28 rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-3/4 rounded bg-slate-200" />
                      </div>
                      <div className="mt-1 h-2 w-16 rounded bg-slate-200 px-3" />
                    </div>
                  </div>
                ))}
              </>
            ) : comments.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-2.5">
                  <img
                    src={comment.avatar}
                    alt={`${comment.author} avatar`}
                    className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/80/EEE/94A3B8?text=U";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                      <div className="text-sm font-semibold text-slate-900">
                        {comment.author}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-800">
                        {comment.text}
                      </p>
                    </div>
                    <div className="mt-1 px-3 text-xs text-slate-500">{comment.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fixed Comment Input */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-3">
        <CommentInput
          avatar={myAvatar}
          value={commentText}
          disabled={false}
          submitting={sending}
          onChange={setCommentText}
          onSubmit={handleAddComment}
        />
      </div>
    </div>
  );
}

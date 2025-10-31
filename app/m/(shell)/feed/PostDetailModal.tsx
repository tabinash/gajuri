"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
} from "lucide-react";
import { commentRepository } from "@/repositories/commentRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks";

type Post = {
  id: number;
  name: string;
  userId: number;
  neighborhood: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  avatar: string;
  images?: { src: string; alt?: string }[];
};

type Comment = {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
};

// API comment shape (from your response.data)
type ApiComment = {
  canDelete: boolean;
  content: string;
  createdAt: string;
  id: number;
  institutionalUser: boolean;
  postId: number;
  timeAgo: string;
  updatedAt: string;
  userId: number;
  userProfilePicture: string;
  username: string;
};

// Memoized comment input with submit loading state
const CommentInput = React.memo(function CommentInput({
  avatar,
  value,
  disabled,
  submitting,
  onChange,
  onSubmit,
}: {
  avatar?: string;
  value: string;
  disabled?: boolean;
  submitting?: boolean;
  onChange: (v: string) => void;
  onSubmit: () => void;
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
          className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-base outline-none disabled:opacity-60"
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

export default function PostDetailModal({
  open,
  onClose,
  post,
}: {
  open: boolean;
  onClose: () => void;
  post: Post | null;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sending, setSending] = useState(false);
const queryClient = useQueryClient();
// post
console.log("Post in Modal:", post?.userId);
  const { user: userData } = useCurrentUser() as { user?: { profilePhotoUrl?: string } };
  const myAvatar: string | undefined = userData?.profilePhotoUrl;

  const mapApiToComment = (c: ApiComment): Comment => ({
    id: c.id,
    author: c.username,
    avatar: c.userProfilePicture,
    text: c.content,
    time: c.timeAgo || "",
  });

  const loadComments = async () => {
    if (!post?.id) return;
    try {
      setLoadingComments(true);
      const response = await commentRepository.getComments(post.id);
      const rows: ApiComment[] = Array.isArray(response?.data) ? response.data : [];
      setComments(rows.map(mapApiToComment));
    } catch (error) {
      console.error("Failed to load comments:", error);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    const content = commentText.trim();
    if (!content || !post?.id || sending) return;
    try {
      setSending(true);
      await commentRepository.addComment({ postId: post.id, content });
      setCommentText("");
      await loadComments();
        // This invalidates the posts query so it refetches
    queryClient.invalidateQueries({ queryKey: ["posts", "user", post?.userId] });
          queryClient.invalidateQueries({ queryKey: ["posts", "general"] });


    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (open && post?.id) {
      loadComments();
    }
    if (!open) {
      setCommentText("");
      setComments([]);
      setImageIndex(0);
    }
  }, [open, post?.id]);

  if (!open || !post) return null;

  const hasImages = !!post.images?.length;
  const imageCount = post.images?.length || 0;

  const prevImage = () => setImageIndex((i) => (i - 1 + imageCount) % imageCount);
  const nextImage = () => setImageIndex((i) => (i + 1) % imageCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={[
          "relative overflow-hidden rounded-lg bg-white",
          hasImages ? "w-[75vw] max-w-5xl h-[82vh]" : "w-full max-w-xl h-[82vh] mx-4",
        ].join(" ")}
      >
        <div className="flex h-full">
          {/* Left: media */}
          {hasImages && (
            <div className="relative flex h-full w-[55%] items-center justify-center bg-black">
              <img
                src={post.images![imageIndex].src}
                alt={post.images![imageIndex].alt ?? `Image ${imageIndex + 1}`}
                className="max-h-full w-auto object-contain"
              />
              {imageCount > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {post.images!.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full ${i === imageIndex ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right: panel */}
          <div className={hasImages ? "w-[45%]" : "w-full"}>
            <div className="flex h-full flex-col">
              {/* Scrollable area */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {/* Header */}
                <div className="border-b border-slate-200 p-3">
                  <div className="flex items-start gap-2.5">
                    <img
                      src={post.avatar}
                      alt={`${post.name} avatar`}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-base font-semibold text-slate-900">
                            {post.name}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                            <span className="truncate">{post.neighborhood}</span>
                            <span>•</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <button
                          onClick={onClose}
                          className="rounded-full p-1 text-slate-800"
                          aria-label="Close"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post text */}
                  <p className="mt-3 whitespace-pre-wrap text-base leading-normal text-slate-800">
                    {post.text}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-base text-slate-700">
                      <Eye size={18} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-base text-slate-700">
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

                {/* Comments list */}
                <div className="p-3">
                  <h3 className="text-base font-semibold text-slate-900">Comments</h3>

                  <div className="mt-3 space-y-3">
                    {loadingComments ? (
                      // Skeletons while loading
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
                      <div className="text-base text-slate-500">No comments yet.</div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5">
                          <img
                            src={comment.avatar}
                            alt={`${comment.author} avatar`}
                            className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/80/EEE/94A3B8?text=U";
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="rounded-2xl bg-slate-50 px-3 py-2">
                              <div className="text-base font-semibold text-slate-900">
                                {comment.author}
                              </div>
                              <p className="mt-1 text-base leading-relaxed text-slate-800">
                                {comment.text}
                              </p>
                            </div>
                            <div className="mt-1 px-3 text-sm text-slate-500">
                              {comment.time}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: memoized comment input with posting effect */}
              <div className="border-t border-slate-200 bg-white p-3">
                <CommentInput
                  avatar={myAvatar}
                  value={commentText}
                  disabled={false}
                  submitting={sending}
                  onChange={setCommentText}
                  onSubmit={handleAddComment}
                />
              </div>
              {/* End footer */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from "react";
import {
  X,
  MoreHorizontal,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Send,
} from "lucide-react";

type Post = {
  name: string;
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

type PostDetailModalProps = {
  open: boolean;
  onClose: () => void;
  post: Post | null;
};

export default function PostDetailModal({ open, onClose, post }: PostDetailModalProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [mockComments, setMockComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      text: "Thanks for sharing this! Very helpful information.",
      time: "30 min ago",
    },
    {
      id: 2,
      author: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      text: "I saw this too! Hope everything is okay.",
      time: "45 min ago",
    },
    {
      id: 3,
      author: "Emily Rodriguez",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
      text: "Keep us updated if you hear anything more.",
      time: "1h ago",
    },
  ]);

  if (!open || !post) return null;

  const hasImages = !!post.images?.length;
  const imageCount = post.images?.length || 0;

  const prevImage = () => setImageIndex((i) => (i - 1 + imageCount) % imageCount);
  const nextImage = () => setImageIndex((i) => (i + 1) % imageCount);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: mockComments.length + 1,
      author: "You",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
      text: commentText,
      time: "Just now",
    };
    setMockComments((prev) => [newComment, ...prev]);
    setCommentText("");
  };

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
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1 text-slate-700"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="flex h-full">
          {/* Left: media (only if images exist) */}
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
                        className={`h-2 w-2 rounded-full ${
                          i === imageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Right: entire panel scrolls, composer fixed at bottom */}
          <div className={hasImages ? "w-[45%]" : "w-full"}>
            <div className="flex h-full flex-col">
              {/* Scrollable area (everything except composer) */}
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
                          <div className="text-sm font-semibold text-slate-900">
                            {post.name}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <span className="truncate">{post.neighborhood}</span>
                            <span>•</span>
                            <span>{post.time}</span>
                          </div>
                        </div>
                        <button className="rounded-full p-1 text-slate-400" aria-label="More options">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Post text */}
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-6 text-slate-800">
                    {post.text}
                  </p>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
                      <Heart size={18} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700">
                      <MessageCircle size={18} />
                      <span>{mockComments.length}</span>
                    </button>
                  </div>
                </div>

                {/* Comments list */}
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
                  <div className="mt-3 space-y-3">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-2.5">
                        <img
                          src={comment.avatar}
                          alt={`${comment.author} avatar`}
                          className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="rounded-2xl bg-slate-50 px-3 py-2">
                            <div className="text-sm font-semibold text-slate-900">
                              {comment.author}
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-700">
                              {comment.text}
                            </p>
                          </div>
                          <div className="mt-1 px-3 text-xs text-slate-500">
                            {comment.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fixed composer at bottom */}
              <div className="border-t border-slate-200 bg-white p-3">
                <div className="flex gap-2.5">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"
                    alt="Your avatar"
                    className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                  />
                  <div className="flex flex-1 gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                      className="rounded-full bg-emerald-600 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send comment"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {/* End fixed composer */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
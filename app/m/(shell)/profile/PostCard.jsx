"use client";

import React, { useState } from "react";
import {
  Globe2,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import postRepository from "@/repositories/PostRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useClickOutside, useCarousel, useCurrentUser, useImageViewer } from "@/hooks";
import ImageViewer from "@/components-mobile/ImageViewer";

const getPostTypePrefix = (type) => {
  switch (type) {
    case "LOST_AND_FOUND":
      return { label: "🔍 Lost & Found", style: "text-amber-700" };
    case "ALERT":
      return { label: "⚠️ Alert", style: "text-red-600" };
    case "NOTICE":
      return { label: "📢 Notice", style: "text-blue-600" };
    default:
      return null;
  }
};

export default function PostCard({
  id,
  postType,
  postId,
  name,
  neighborhood,
  time,
  text,
  likes,
  comments,
  avatar,
  images = [],
  onOpen,
  onComment,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const count = images.length;
  const { index, prev, next } = useCarousel(count);
  const menuRef = useClickOutside(() => setShowMenu(false));
  const { userId } = useCurrentUser();
  const queryClient = useQueryClient();
  const imageViewer = useImageViewer();
  const postTypePrefix = getPostTypePrefix(postType);

  const handleDelete = async () => {
    await postRepository.deletePost(postId);
    queryClient.invalidateQueries({ queryKey: ["posts", "general"] });
    queryClient.invalidateQueries({ queryKey: ["posts", "user", id] });
    setShowMenu(false);
  };

  return (
    <article className="bg-white border-b border-slate-200">
      <div className="px-4 py-3">
        {/* Header */}
        <header className="flex items-start gap-3">
          <Link
            href={{
              pathname: "/m/profile",
              query: { userId: id },
            }}
            className="flex items-start gap-3 min-w-0 flex-1"
          >
            <img
              src={avatar}
              alt={`${name} avatar`}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-base font-semibold text-slate-900">
                    {name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                    <span className="truncate">{neighborhood}</span>
                    <span>•</span>
                    <span>{time}</span>
                    <span>•</span>
                    <Globe2 size={14} className="text-slate-400" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {userId === id && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="More options"
                className="shrink-0 rounded-full p-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <MoreHorizontalIcon size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 py-1">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-base text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Body */}
        <p className="mt-3 whitespace-pre-wrap text-base leading-normal text-slate-800">
          {postTypePrefix && (
            <span className={`font-semibold  ${postTypePrefix.style}`}>
              {postTypePrefix.label} {" "}
              <br/>
            </span>
          )}
          {text.length > 200 ? `${text.slice(0, 200)}...` : text}{" "}
          {text.length > 200 && (
            <span className="text-blue-600 cursor-pointer" onClick={onOpen}>
              See more
            </span>
          )}
        </p>

        {/* Carousel */}
        {count > 0 && (
          <div className="relative mt-3 overflow-hidden cursor-pointer -mx-4">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt ?? `post image ${i + 1}`}
                  className="h-[280px] w-full shrink-0 object-cover"
                  draggable={false}
                  onClick={() => imageViewer.open(images, i)}
                />
              ))}
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-slate-700 shadow hover:bg-white"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <span
                      key={i}
                      className={[
                        "h-1.5 w-1.5 rounded-full bg-white/70 shadow",
                        i === index ? "bg-white" : "",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-base text-slate-700 hover:bg-slate-50"
            aria-label="Like"
          >
            <Eye size={18} className="text-slate-500 group-hover:text-emerald-600" />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-base text-slate-700 hover:bg-slate-50"
            aria-label="Comment"
            onClick={onComment ?? onOpen}
          >
            <MessageCircle size={18} className="text-slate-500 group-hover:text-emerald-600" />
            <span>{comments}</span>
          </button>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      <ImageViewer
        isOpen={imageViewer.isOpen}
        images={imageViewer.images}
        currentIndex={imageViewer.currentIndex}
        onClose={imageViewer.close}
        onNext={imageViewer.next}
        onPrev={imageViewer.prev}
        onGoTo={imageViewer.goTo}
      />
    </article>
  );
}
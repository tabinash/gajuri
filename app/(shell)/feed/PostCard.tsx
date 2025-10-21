"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Globe2,
  MoreHorizontal,
  Eye,
  Trash,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreHorizontalIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import postRepository from "@/repositories/PostRepository";
import { useQueryClient } from "@tanstack/react-query";


export type Post = {
  id: string;
  postId?: string;
  name: string;
  neighborhood: string;
  time: string;
  text: string;
  likes: number;
  comments: number;
  avatar: string;
  images?: { src: string; alt?: string }[];
};

type Handlers = {
  onOpen?: () => void;
  onComment?: () => void;
};

export default function PostCard({
  id,
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
}: Post & Handlers) {
  const [index, setIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const count = images.length;
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);
  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
  const userId = userData?.id;
const queryClient = useQueryClient();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete =async () => {
    const response = await postRepository.deletePost(postId);
        queryClient.invalidateQueries({ queryKey: ["posts", "general"] });
        queryClient.invalidateQueries({ queryKey: ["posts", "user", id] });


    console.log("Delete post with ID:", postId);
    setShowMenu(false);
    // TODO: Implement actual delete functionality
  };

  return (
    <article className="rounded-2xl border border-black/15 bg-white shadow-sm">
      <div className="p-4">
        {/* Header */}
        <header className="flex items-start gap-3">
          <Link
            href={{
              pathname: "/profile",
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
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {name}
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
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

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 py-1">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
        <p className="mt-3 whitespace-pre-wrap text-[15px] leading-6 text-slate-800">
          {text.length > 200 ? `${text.slice(0, 200)}...` : text}{" "}
          {text.length > 200 && (
            <span className="text-blue-600 cursor-pointer" onClick={onOpen}>
              See more
            </span>
          )}
        </p>

        {/* Carousel (one image at a time) */}
        {count > 0 && (
          <div className="relative mt-3 overflow-hidden rounded-xl cursor-pointer">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt ?? `post image ${i + 1}`}
                  className="h-[360px] w-full shrink-0 object-cover"
                  draggable={false}
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

                {/* Dots */}
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
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Like"
          >
            <Eye size={18} className="text-slate-500 group-hover:text-emerald-600" />
            <span>{likes}</span>
          </button>

          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Comment"
            onClick={onComment ?? onOpen}
          >
            <MessageCircle size={18} className="text-slate-500 group-hover:text-emerald-600" />
            <span>{comments}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, X, ChevronDown, Loader2, CheckCircle, Globe } from "lucide-react";
import postRepository from "@/repositories/PostRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useClickOutside } from "@/hooks";

export default function FeedLayout({ children }) {
  const pathname = usePathname();
  const [postContent, setPostContent] = useState("");
  const queryClient = useQueryClient();

  const [postLink, setPostLink] = useState("");
  const [postType, setPostType] = useState("GENERAL");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState(null);

  const textareaRef = useRef(null);
  const dropdownRef = useClickOutside(() => setShowTypeDropdown(false));
  const fileInputRef = useRef(null);

  const { user, avatar, username } = useCurrentUser();
  const userAvatar = avatar;
  const firstName = (username || "User").split(" ")[0];

  const POST_TYPES = user?.institutionalUser
    ? [
        { value: "GENERAL", label: "General", icon: Globe, color: "text-slate-600", bgColor: "bg-slate-50", hoverColor: "hover:bg-slate-100" },
        { value: "NEWS", label: "News", icon: Globe, color: "text-blue-600", bgColor: "bg-blue-50", hoverColor: "hover:bg-blue-100" },
        { value: "NOTICE", label: "Notice", icon: Globe, color: "text-amber-600", bgColor: "bg-amber-50", hoverColor: "hover:bg-amber-100" },
        { value: "ALERT", label: "Alert", icon: Globe, color: "text-red-600", bgColor: "bg-red-50", hoverColor: "hover:bg-red-100" },
        { value: "LOST_AND_FOUND", label: "Lost & Found", icon: Globe, color: "text-purple-600", bgColor: "bg-purple-50", hoverColor: "hover:bg-purple-100" },
      ]
    : [
        { value: "GENERAL", label: "General", icon: Globe, color: "text-slate-600", bgColor: "bg-slate-50", hoverColor: "hover:bg-slate-100" },
        { value: "ALERT", label: "Alert", icon: Globe, color: "text-red-600", bgColor: "bg-red-50", hoverColor: "hover:bg-red-100" },
        { value: "LOST_AND_FOUND", label: "Lost & Found", icon: Globe, color: "text-purple-600", bgColor: "bg-purple-50", hoverColor: "hover:bg-purple-100" },
      ];

  const selectedType = POST_TYPES.find((t) => t.value === postType) || POST_TYPES[0];

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);

    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(newPreviews);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    URL.revokeObjectURL(imagePreviews[index]);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmitPost = async () => {
    const trimmed = postContent.trim();
    if (!trimmed) return;

    setIsPosting(true);
    setPostError(null);

    try {
      if (images.length > 0) {
        const formData = new FormData();
        formData.append("content", postContent.trim());
        formData.append("link", postLink.trim() || "");
        formData.append("postType", postType);

        images.forEach((image) => {
          formData.append("images", image);
        });

        const response = await postRepository.postCreateSecondary(formData);
        console.log("Post created with images:", response.data);
      } else {
        const postData = {
          content: postContent.trim(),
          link: postLink.trim() || null,
          postType: postType,
        };
        const response = await postRepository.postCreatePrimary(postData);
        console.log("Post created without images:", response.data);
      }

      queryClient.invalidateQueries({ queryKey: ["posts", "general"] });

      setPostSuccess(true);

      setTimeout(() => {
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setPostContent("");
        setPostLink("");
        setImages([]);
        setImagePreviews([]);
        setPostType("GENERAL");
        setIsExpanded(false);
        setPostSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating post:", error);
      setPostError(error?.message || "Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setPostContent("");
    setPostLink("");
    setImages([]);
    setImagePreviews([]);
    setPostType("GENERAL");
    setIsExpanded(false);
    setPostError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitPost();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Check if we're on a post detail page
  const isPostDetail = pathname.startsWith("/m/feed/") && pathname !== "/m/feed" && !pathname.includes("news&notice");

  // If post detail page, just render children without post creation card/tabs
  if (isPostDetail) {
    return <>{children}</>;
  }

  return (
    <div>
      {/* Post Creation Card */}
      <div className="bg-white border-b border-slate-200">
        <div className="p-4">
          {!isExpanded ? (
            <div className="flex items-center gap-3">
              <img
                src={userAvatar || "https://via.placeholder.com/40"}
                alt={username}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/40/EEE/94A3B8?text=U";
                }}
              />

              <button
                onClick={() => setIsExpanded(true)}
                className="flex-1 text-left px-5 py-3 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 font-medium"
              >
                What's on your mind, {firstName}?
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={userAvatar || "https://via.placeholder.com/40"}
                    alt={username}
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/40/EEE/94A3B8?text=U";
                    }}
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{username}</p>
                    <div className="relative mt-0.5" ref={dropdownRef}>
                      <button
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        disabled={isPosting}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${selectedType.bgColor} ${selectedType.color} ${selectedType.hoverColor} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <selectedType.icon size={12} />
                        <span>{selectedType.label}</span>
                        <ChevronDown size={12} />
                      </button>

                      {showTypeDropdown && (
                        <div className="absolute top-full left-0 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-1">
                          {POST_TYPES.map((type) => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.value}
                                onClick={() => {
                                  setPostType(type.value);
                                  setShowTypeDropdown(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-sm hover:bg-slate-50 transition-colors ${
                                  type.value === postType ? "bg-slate-50" : ""
                                }`}
                              >
                                <Icon size={14} className={type.color} />
                                <span className={`font-medium ${type.color}`}>{type.label}</span>
                                {type.value === postType && (
                                  <CheckCircle size={14} className={`ml-auto ${type.color}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPosting}
                placeholder={`What's on your mind, ${firstName}?`}
                className="w-full min-h-[120px] max-h-[400px] px-0 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 border-0 outline-none resize-none disabled:opacity-50"
                style={{ lineHeight: "1.5" }}
              />

              {imagePreviews.length > 0 && (
                <div
                  className={`grid gap-2 ${
                    imagePreviews.length === 1
                      ? "grid-cols-1"
                      : imagePreviews.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2"
                  }`}
                >
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-52 object-cover" />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        disabled={isPosting}
                        className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-slate-900 opacity-0 group-hover:opacity-100"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {postError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{postError}</span>
                </div>
              )}

              <div className="border-t border-slate-200" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {images.length < 4 && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPosting}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                        title="Add photos"
                      >
                        <Image size={20} className="text-green-500" />
                        <span className="hidden sm:inline">Photo</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        disabled={isPosting}
                        className="hidden"
                      />
                    </>
                  )}
                  {images.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500 font-medium">
                      {images.length}/4 photos
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isPosting}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!postContent.trim() || isPosting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 min-w-[90px] justify-center"
                  >
                    {postSuccess ? (
                      <>
                        <CheckCircle size={16} />
                        Posted!
                      </>
                    ) : isPosting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Posting
                      </>
                    ) : (
                      <>Post</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Posts */}
      {children}
    </div>
  );
}

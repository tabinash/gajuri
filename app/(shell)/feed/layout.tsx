"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, Video, Smile, Send, X, ChevronDown, Link2, Loader2, CheckCircle } from "lucide-react";
import postRepository from "@/repositories/PostRepository";
import { useQueryClient } from "@tanstack/react-query";



export default function FeedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [postContent, setPostContent] = useState("");
  const queryClient = useQueryClient();

  const [postLink, setPostLink] = useState("");
  const [postType, setPostType] = useState("GENERAL");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
  const userAvatar = userData?.profilePhotoUrl || userData?.profilePicture;
  const username = userData?.username || "User";
  const firstName = username.split(" ")[0];

  userData?.institutionalUser
const POST_TYPES = userData?.institutionalUser
  ? [
      { value: "GENERAL", label: "GENERAL", color: "text-slate-700" },
      { value: "NEWS", label: "NEWS", color: "text-blue-700" },
      { value: "NOTICE", label: "NOTICE", color: "text-amber-700" },
      { value: "ALERT", label: "ALERT", color: "text-red-700" },
      { value: "LOST_AND_FOUND", label: "LOST & FOUND", color: "text-purple-700" },
    ]
  : [
      { value: "GENERAL", label: "GENERAL", color: "text-slate-700" },
      { value: "ALERT", label: "ALERT", color: "text-red-700" },
      { value: "LOST_AND_FOUND", label: "LOST & FOUND", color: "text-purple-700" },
    ];


  const selectedType = POST_TYPES.find((t) => t.value === postType) || POST_TYPES[0];

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clean up image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const newImages = [...images, ...files].slice(0, 4);
    setImages(newImages);

    // Create previews
    const newPreviews = newImages.map(file => URL.createObjectURL(file));
    // Revoke old previews
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews(newPreviews);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Revoke the removed preview
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
          formData.append(`images`, image);
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

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["posts", "general"] });

      // Show success state
      setPostSuccess(true);

      // Reset form after a short delay
      setTimeout(() => {
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setPostContent("");
        setPostLink("");
        setImages([]);
        setImagePreviews([]);
        setPostType("GENERAL");
        setIsExpanded(false);
        setShowLinkInput(false);
        setPostSuccess(false);
      }, 1500);

    } catch (error: any) {
      console.error("Error creating post:", error);
      setPostError(error?.message || "Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleCancel = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setPostContent("");
    setPostLink("");
    setImages([]);
    setImagePreviews([]);
    setPostType("GENERAL");
    setIsExpanded(false);
    setShowLinkInput(false);
    setPostError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitPost();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Post Creation Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* User Avatar */}
            <img
              src={userAvatar || "https://via.placeholder.com/40"}
              alt={username}
              className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/40/EEE/94A3B8?text=U";
              }}
            />

            {/* Post Input */}
            <div className="flex-1">
              {!isExpanded ? (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="w-full rounded-full bg-slate-50 px-4 py-2.5 text-left text-slate-500 hover:bg-slate-100 transition-all duration-200 border border-slate-200"
                >
                  What's on your mind, {firstName}?
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Post Type Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      disabled={isPosting}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className={selectedType.color}>{selectedType.label}</span>
                      <ChevronDown size={16} className="text-slate-500" />
                    </button>

                    {/* Dropdown */}
                    {showTypeDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-10 py-1">
                        {POST_TYPES.map((type) => (
                          <button
                            key={type.value}
                            onClick={() => {
                              setPostType(type.value);
                              setShowTypeDropdown(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                              type.value === postType ? "bg-slate-50" : ""
                            }`}
                          >
                            <span className={type.color}>{type.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Input */}
                  <textarea
                    ref={textareaRef}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isPosting}
                    placeholder={`What's on your mind, ${firstName}?`}
                    className="w-full min-h-[120px] max-h-[300px] rounded-lg bg-slate-50 px-4 py-3 text-[15px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-slate-200 outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  {/* Image Previews */}
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
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            disabled={isPosting}
                            className="absolute top-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-full hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Link Input */}
                  {showLinkInput && (
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={postLink}
                        onChange={(e) => setPostLink(e.target.value)}
                        disabled={isPosting}
                        placeholder="https://example.com"
                        className="flex-1 rounded-lg bg-slate-50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent border border-slate-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => {
                          setShowLinkInput(false);
                          setPostLink("");
                        }}
                        disabled={isPosting}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Add Media Buttons */}
                  <div className="flex items-center gap-3">
                    {images.length < 4 && (
                      <>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isPosting}
                          className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Image size={16} />
                          Add Photos ({images.length}/4)
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
                    {!showLinkInput && (
                      <button
                        onClick={() => setShowLinkInput(true)}
                        disabled={isPosting}
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Link2 size={16} />
                        Add Link
                      </button>
                    )}
                  </div>

                  {/* Error Message */}
                  {postError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                      {postError}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleCancel}
                      disabled={isPosting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitPost}
                      disabled={!postContent.trim() || isPosting}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm min-w-[100px] justify-center"
                    >
                      {postSuccess ? (
                        <>
                          <CheckCircle size={16} />
                          Posted!
                        </>
                      ) : isPosting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Post
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons - Show only when not expanded */}
        {!isExpanded && (
          <div className="border-t border-slate-200 px-4 py-2">
            <div className="flex items-center justify-around">
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
              >
                <Image size={20} className="text-green-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Photo</span>
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
              >
                <Video size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Video</span>
              </button>

              <button
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors group"
              >
                <Smile size={20} className="text-yellow-600 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Feeling</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Header Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg shadow-sm">
        <TabButton label="General Posts" href="/feed" active={pathname === "/feed"} />
        <TabButton
          label="News & Notice"
          href="/feed/news&notice"
          active={pathname === "/feed/news&notice"}
        />
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

function TabButton({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 text-center px-4 py-3 -mb-px font-medium text-sm border-b-2 transition-all ${
        active
          ? "border-blue-500 text-blue-600 bg-blue-50/50"
          : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}
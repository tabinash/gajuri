"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Image, Video, Smile, Send, X, ChevronDown, Link2, Loader2, CheckCircle, Globe } from "lucide-react";
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

  const POST_TYPES = userData?.institutionalUser
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
      {/* Post Creation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4">
          {/* Collapsed State - Twitter/Facebook Style */}
          {!isExpanded ? (
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <img
                src={userAvatar || "https://via.placeholder.com/40"}
                alt={username}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/40/EEE/94A3B8?text=U";
                }}
              />

              {/* Trigger Input */}
              <button
                onClick={() => setIsExpanded(true)}
                className="flex-1 text-left px-5 py-3 rounded-full bg-slate-50 hover:bg-slate-100 transition-colors text-slate-500 font-medium"
              >
                What's on your mind, {firstName}?
              </button>
            </div>
          ) : (
            /* Expanded State */
            <div className="space-y-3">
              {/* Header with Avatar and Post Type */}
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
                    {/* Post Type Dropdown */}
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

                      {/* Dropdown Menu */}
                      {showTypeDropdown && (
                        <div className="absolute top-full left-0 mt-1 min-w-[160px] rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-1 animate-in fade-in slide-in-from-top-2 duration-200">
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

              {/* Content Input */}
              <textarea
                ref={textareaRef}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isPosting}
                placeholder={`What's on your mind, ${firstName}?`}
                className="w-full min-h-[120px] max-h-[400px] px-0 py-2 text-[15px] text-slate-900 placeholder:text-slate-400 border-0 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed focus:ring-0"
                style={{ lineHeight: '1.5' }}
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
                    <div key={index} className="relative group rounded-xl overflow-hidden">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-52 object-cover"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        disabled={isPosting}
                        className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-slate-900 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Link Input */}
              {/* {showLinkInput && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <Link2 size={18} className="text-slate-400" />
                  <input
                    type="url"
                    value={postLink}
                    onChange={(e) => setPostLink(e.target.value)}
                    disabled={isPosting}
                    placeholder="Paste link here"
                    className="flex-1 bg-transparent px-2 py-1 text-sm text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={() => {
                      setShowLinkInput(false);
                      setPostLink("");
                    }}
                    disabled={isPosting}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                  </button>
                </div>
              )} */}

              {/* Error Message */}
              {postError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span>{postError}</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* Action Bar */}
              <div className="flex items-center justify-between">
                {/* Left Side - Media Buttons */}
                <div className="flex items-center gap-1">
                  {images.length < 4 && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPosting}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  
                  {/* {!showLinkInput && (
                    <button
                      onClick={() => setShowLinkInput(true)}
                      disabled={isPosting}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Add link"
                    >
                      <Link2 size={20} className="text-blue-500" />
                      <span className="hidden sm:inline">Link</span>
                    </button>
                  )} */}

                  {/* Image Counter */}
                  {images.length > 0 && (
                    <span className="ml-2 text-xs text-slate-500 font-medium">
                      {images.length}/4 photos
                    </span>
                  )}
                </div>

                {/* Right Side - Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isPosting}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPost}
                    disabled={!postContent.trim() || isPosting}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm min-w-[90px] justify-center"
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
                      <>
                        Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions - Only show when collapsed */}
        {/* {!isExpanded && (
          <div className="border-t border-slate-200 px-4 py-2">
            <div className="flex items-center justify-around">
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => fileInputRef.current?.click(), 100);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Image size={20} className="text-green-500" />
                <span>Photo</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <button
                onClick={() => {
                  setIsExpanded(true);
                  setShowLinkInput(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Link2 size={20} className="text-blue-500" />
                <span>Link</span>
              </button>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <button
                onClick={() => setIsExpanded(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Smile size={20} className="text-amber-500" />
                <span>Feeling</span>
              </button>
            </div>
          </div>
        )} */}
      </div>

      {/* Header Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center">
          <TabButton label="General Posts" href="/feed" active={pathname === "/feed"} />
          <TabButton
            label="News & Notice"
            href="/feed/news&notice"
            active={pathname === "/feed/news&notice"}
          />
        </div>
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
      className={`flex-1 text-center px-6 py-3.5 font-semibold text-[15px] transition-all relative ${
        active
          ? "text-blue-600"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
      }`}
    >
      {label}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
      )}
    </Link>
  );
}
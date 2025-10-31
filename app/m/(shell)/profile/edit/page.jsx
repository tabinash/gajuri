"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, Check, Loader2 } from "lucide-react";
import { updateBio, updateCoverProfile, updateProfileImage } from "@/repositories/UserRepository";
import { useCurrentUser } from "@/hooks";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  const [isLoadingCover, setIsLoadingCover] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    website: "",
    profilePhotoUrl: "",
    coverPhotoUrl: "",
  });

  // Image previews
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  // Get user data
  const { user: userData, userId } = useCurrentUser();

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("chemiki-editProfileData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        setProfilePreview(parsed.profilePhotoUrl || "");
        setCoverPreview(parsed.coverPhotoUrl || "");
      } catch (error) {
        console.error("Failed to parse profile data:", error);
      }
    }
  }, []);

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cover image change - uploads immediately
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    const data = new FormData();
    data.append("coverPicture", file);
    
    try {
      setIsLoadingCover(true);
      const response = await updateCoverProfile(userId, data);
      console.log("Uploading cover picture...",response);
      if (response?.success) {
        const updatedProfile = { ...userData, coverPhotoUrl: response.data?.coverPhotoUrl };
        localStorage.setItem("chemiki-userProfile", JSON.stringify(updatedProfile));
        localStorage.setItem("chemiki-editProfileData", JSON.stringify(updatedProfile));
        // Update preview with server URL
        if (response.data?.coverPhotoUrl) {
          setCoverPreview(response.data.coverPhotoUrl);
        }
      } else {
        throw new Error(response?.message || "Failed to update cover");
      }
    } catch (err) {
      console.error("Cover update error:", err);
      alert("Error updating cover picture");
      // Revert preview on error
      setCoverPreview(formData.coverPhotoUrl || "");
    } finally {
      setIsLoadingCover(false);
    }
  };

  // Profile image change - uploads immediately
  const handleProfileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);

    const data = new FormData();
    data.append("profilePicture", file);

    try {
      console.log("Uploading profile picture...");
      setIsLoadingProfile(true);
      const response = await updateProfileImage(userId, data);
      console.log("Profile picture upload response:", response.data.profilePhotoUrl);
      if (response?.success) {
        const updatedProfile = { ...userData, profilePhotoUrl: response.data?.profilePhotoUrl };
        localStorage.setItem("chemiki-userProfile", JSON.stringify(updatedProfile));
        localStorage.setItem("chemiki-editProfileData", JSON.stringify(updatedProfile));
        // Update preview with server URL
        if (response.data?.profilePhotoUrl) {
          setProfilePreview(response.data.profilePhotoUrl);
        }
      } else {
        throw new Error(response?.message || "Failed to update profile picture");
      }
    } catch (err) {
      console.error("Profile picture update error:", err);
      alert("Error updating profile picture");
      // Revert preview on error
      setProfilePreview(formData.profilePhotoUrl || "");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Update bio only (username, email, website)
  const handleSubmitBio = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("User ID not found");
      return;
    }

    setIsLoadingBio(true);
    const data = {
      username: formData.username,
      email: formData.email,
      website: formData.website || "",
    };

    try {
      const response = await updateBio(userId, data);
      if (response?.success) {
        setSaveSuccess(true);
        const updatedProfile = { ...userData, ...data };
        localStorage.setItem("chemiki-userProfile", JSON.stringify(response.data));
        localStorage.removeItem("chemiki-editProfileData");

        setTimeout(() => {
          setSaveSuccess(false);
          router.push(`/m/profile?userId=${userId}`);
        }, 1000);
      } else {
        throw new Error(response?.message || "Failed to update bio");
      }
    } catch (err) {
      console.error("Bio update error:", err);
      alert("Error updating bio");
    } finally {
      setIsLoadingBio(false);
    }
  };

  const canSave = formData.username && formData.email && !isLoadingBio && !saveSuccess;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Native mobile pattern */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded-full hover:bg-slate-100 active:bg-slate-200"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-lg font-semibold text-slate-900">Edit Profile</h1>

          <button
            onClick={handleSubmitBio}
            disabled={!canSave}
            className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
              canSave
                ? "bg-blue-600 text-white active:bg-blue-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {saveSuccess ? (
              <span className="flex items-center gap-1">
                <Check size={16} />
                Saved
              </span>
            ) : isLoadingBio ? (
              <span className="flex items-center gap-1">
                <Loader2 size={16} className="animate-spin" />
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmitBio} className="pb-6">
        {/* Cover Photo - Edge to edge, taller for mobile */}
        <div className="relative h-44 bg-gradient-to-br from-blue-500 to-purple-600">
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}

          {/* Upload overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <label
              className={`bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 transition-transform ${
                isLoadingCover ? "opacity-50" : ""
              }`}
            >
              {isLoadingCover ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera size={18} />
                  <span className="text-sm font-medium">Change Cover</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
                disabled={isLoadingCover}
              />
            </label>
          </div>
        </div>

        {/* Profile Picture - Overlapping with larger size */}
        <div className="px-4 -mt-16 pb-6">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Camera size={32} className="text-slate-400" />
                </div>
              )}
            </div>

            {/* Camera button - larger touch target */}
            <label
              className={`absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full cursor-pointer border-4 border-white shadow-lg active:scale-95 transition-transform ${
                isLoadingProfile ? "opacity-50" : ""
              }`}
            >
              {isLoadingProfile ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Camera size={20} />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
                disabled={isLoadingProfile}
              />
            </label>
          </div>
        </div>

        {/* Form Fields - Single column, full width */}
        <div className="px-4 space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter your username"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              inputMode="email"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Website
              <span className="text-slate-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              inputMode="url"
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="www.yourwebsite.com"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
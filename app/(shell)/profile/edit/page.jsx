"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, ArrowLeft, Check, X, Loader2 } from "lucide-react";
import { updateBio, updateCoverProfile, updateProfileImage } from "@/repositories/UserRepository";
import { useCurrentUser } from "@/hooks";
import { storage } from "@/utils";

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

  // Image previews and files
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Get user ID from hook
  const { userId } = useCurrentUser();

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = storage.get("chemiki-editProfileData");
    if (savedData) {
      setFormData(savedData);
      setProfilePreview(savedData.profilePhotoUrl || "");
      setCoverPreview(savedData.coverPhotoUrl || "");
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
          router.push(`/profile?userId=${userId}`);
        }, 1500);
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

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Edit Profile</h1>
            <p className="text-sm text-slate-500">Update your personal information</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmitBio} className="space-y-6">
          {/* Cover & Profile Photos */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600 group">
              {coverPreview && (
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <label className={`bg-white/90 text-slate-900 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-white transition-colors ${isLoadingCover ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isLoadingCover ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      Change Cover
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

            {/* Profile Picture */}
            <div className="px-6 pb-6">
              <div className="-mt-16 relative z-10 flex items-end gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Camera size={32} className="text-slate-400" />
                      </div>
                    )}
                  </div>
                  <label className={`absolute bottom-1 right-1 bg-white text-slate-900 p-2.5 rounded-full cursor-pointer border-2 border-white shadow-lg hover:bg-slate-50 transition-colors ${isLoadingProfile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {isLoadingProfile ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Camera size={18} />
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
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="www.yourwebsite.com"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <X size={18} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoadingBio || saveSuccess}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {saveSuccess ? (
                <>
                  <Check size={18} />
                  Saved Successfully!
                </>
              ) : isLoadingBio ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
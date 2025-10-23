"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { updateCoverProfile, updateProfileImage } from "@/repositories/UserRepository"; // ✅ Import the actual API functions

export default function CompleteProfilePage() {
  const router = useRouter();

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Handle profile photo selection
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle cover photo selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove profile photo
  const removeProfilePhoto = () => {
    setProfilePhoto(null);
    setProfilePreview("");
    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  // Remove cover photo
  const removeCoverPhoto = () => {
    setCoverPhoto(null);
    setCoverPreview("");
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!profilePhoto || !coverPhoto) {
      setError("Please upload both profile and cover photos");
      setLoading(false);
      return;
    }

    try {
      // Get user ID from localStorage
      const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
      const userId = userData?.id;

      if (!userId) {
        setError("User ID not found. Please log in again.");
        setLoading(false);
        return;
      }

      // ✅ Upload profile picture
      const profileFormData = new FormData();
      profileFormData.append("profilePicture", profilePhoto);
      
      console.log("Uploading profile picture...");
      const profileResponse = await updateProfileImage(userId, profileFormData);
      
      if (!profileResponse?.data?.success) {
        throw new Error(profileResponse?.data?.message || "Failed to upload profile picture");
      }
      
      console.log("✅ Profile picture uploaded:", profileResponse.data?.profilePhotoUrl);

      // ✅ Upload cover picture
      const coverFormData = new FormData();
      coverFormData.append("coverPicture", coverPhoto);
      
      console.log("Uploading cover picture...");
      const coverResponse = await updateCoverProfile(userId, coverFormData);
      
      if (!coverResponse?.data?.success) {
        throw new Error(coverResponse?.data?.message || "Failed to upload cover picture");
      }
      
      console.log("✅ Cover picture uploaded:", coverResponse.data?.coverPhotoUrl);

      // ✅ Update localStorage with new photo URLs
      const updatedProfile = {
        ...userData,
        profilePhotoUrl: profileResponse.data?.profilePhotoUrl,
        coverPhotoUrl: coverResponse.data?.coverPhotoUrl,
      };
      localStorage.setItem("chemiki-userProfile", JSON.stringify(updatedProfile));

      // ✅ Redirect to feed after successful upload
      router.replace("/feed");
    } catch (err: any) {
      console.error("❌ Upload failed:", err);
      setError(err?.message || err?.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh">
      {/* Background */}
      <img
        src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2400&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Centered column */}
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[640px] items-center justify-center p-4 sm:p-6">
        <div className="w-full">
          {/* Card */}
          <div className="mx-auto w-full max-w-[520px] rounded-[18px] bg-white p-6 shadow-2xl sm:p-8">
            <h1 className="text-center text-[22px] font-semibold text-gray-800">
              Complete Your Profile
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Upload your profile and cover photos to get started
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              {/* Cover Photo Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cover Photo
                </label>
                <div className="relative">
                  {coverPreview ? (
                    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-[12px] border-2 border-gray-200">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeCoverPhoto}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="flex aspect-[3/1] w-full flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-green-600 hover:bg-green-50 hover:text-green-600"
                    >
                      <Upload size={28} />
                      <span className="text-sm font-medium">
                        Click to upload cover photo
                      </span>
                      <span className="text-xs text-gray-400">
                        Recommended: 1500x500px
                      </span>
                    </button>
                  )}
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profilePreview ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200">
                        <img
                          src={profilePreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeProfilePhoto}
                          className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition hover:border-green-600 hover:bg-green-50 hover:text-green-600"
                      >
                        <Camera size={24} />
                      </button>
                    )}
                    <input
                      ref={profileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="text-sm font-medium text-green-600 underline hover:text-green-700"
                    >
                      {profilePreview ? "Change photo" : "Upload photo"}
                    </button>
                    <p className="mt-1 text-xs text-gray-400">
                      Recommended: 400x400px
                    </p>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={!profilePhoto || !coverPhoto || loading}
                className="mt-2 w-full rounded-full bg-green-600 px-6 py-3 text-[15px] font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Continue to Feed"
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-gray-500">
              You can update these photos later in your profile settings
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
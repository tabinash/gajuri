"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";

export default function EditProfilePage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    website: "",
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "profile") {
        setProfileFile(file);
        setProfilePreview(previewUrl);
      } else {
        setCoverFile(file);
        setCoverPreview(previewUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Construct FormData to send like multipart/form-data
    const data = new FormData();
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("website", formData.website);
    if (profileFile) data.append("profilePicture", profileFile);
    if (coverFile) data.append("coverPicture", coverFile);

    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        body: data,
      });
      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200">
        {coverPreview ? (
          <Image
            src={coverPreview}
            alt="Cover Preview"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No Cover Image
          </div>
        )}
        <label className="absolute bottom-3 right-3 cursor-pointer bg-white p-2 rounded-full shadow hover:bg-gray-100">
          <Camera size={18} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "cover")}
          />
        </label>
      </div>

      {/* Profile Picture */}
      <div className="relative -mt-12 flex justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-4 border-white overflow-hidden bg-gray-100">
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="Profile Preview"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-gray-100">
            <Camera size={16} />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "profile")}
            />
          </label>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-10 max-w-md bg-white rounded-xl shadow p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="Your website (optional)"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-green-600 text-white py-2.5 font-medium hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

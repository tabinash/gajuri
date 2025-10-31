"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  Image as ImageIcon,
  Package,
  MapPin,
  ChevronDown,
  Phone,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { addProduct } from "@/repositories/MarketplaceRepository";

export default function NewProductPage() {
  const router = useRouter();
  const [productData, setProductData] = useState({
    name: "",
    category: "ELECTRONIC",
    price: "",
    location: "",
    condition: "used",
    ownerContact: "",
    description: "",
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  const handleChange = (e) =>
    setProductData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...images, ...files].slice(0, 10); // max 10
    setImages(next);

    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    setImagePreviews(next.map((f) => URL.createObjectURL(f)));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idx) => {
    const nextImages = images.filter((_, i) => i !== idx);
    const nextPreviews = imagePreviews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(imagePreviews[idx]);
    setImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    setUploadProgress(0);

    const payload = {
      name: productData.name.trim(),
      category: productData.category.trim(),
      price: productData.price.trim(),
      location: productData.location.trim(),
      condition: productData.condition.trim(),
      ownerContact: productData.ownerContact.trim(),
      description: productData.description.trim(),
    };

    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => formData.append(k, v));
    images.forEach((img) => formData.append("images", img));

    try {
      await addProduct(formData, {
        onUploadProgress: (evt) => {
          if (!evt?.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        },
      });

      setSuccess(true);
      setUploadProgress(100);

      setTimeout(() => {
        router.push("/m/market");
      }, 900);
    } catch (err) {
      console.error("Failed to add product:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add product. Please try again."
      );
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const isValid =
    productData.name.trim() !== "" &&
    productData.price.trim() !== "" &&
    images.length > 0 &&
    !isSubmitting;

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Native mobile pattern */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="p-1 rounded-full hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>

          <h1 className="text-lg font-semibold text-slate-900">New Product</h1>

          <button
            type="button"
            onClick={() => isValid && handleSubmit()}
            disabled={!isValid}
            className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-colors ${
              isValid
                ? "bg-blue-600 text-white active:bg-blue-700"
                : "bg-slate-100 text-slate-400"
            }`}
          >
            {success ? (
              <span className="flex items-center gap-1">
                <CheckCircle size={16} />
                Posted
              </span>
            ) : isSubmitting ? (
              <span className="flex items-center gap-1">
                <Loader2 size={16} className="animate-spin" />
              </span>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </header>

      {uploadProgress !== null && (
        <div className="h-1 bg-slate-200">
          <div
            className="h-full bg-blue-600 transition-[width] duration-200"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="pb-6">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="px-4 py-5 space-y-5">
          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Photos *
            </label>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-300 bg-slate-50 active:bg-slate-100 px-4 py-4 transition-colors disabled:opacity-60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-slate-200">
                <ImageIcon size={24} className="text-slate-600" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-slate-900">
                  Add photos
                </div>
                <div className="text-xs text-slate-500">
                  JPG/PNG, up to 10 photos
                </div>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={isSubmitting}
            />

            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      disabled={isSubmitting}
                      className="absolute top-1.5 right-1.5 bg-slate-900/75 text-white p-1 rounded-full active:bg-slate-900 shadow disabled:opacity-60"
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Name *
            </label>
            <input
              id="name"
              name="name"
              value={productData.name}
              onChange={handleChange}
              placeholder="What are you selling?"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={productData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your item"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none disabled:opacity-60"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price *
            </label>
            <input
              id="price"
              name="price"
              value={productData.price}
              onChange={handleChange}
              placeholder="Rs 0"
              inputMode="numeric"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category
            </label>
            <div className="relative">
              <Package
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <select
                id="category"
                name="category"
                value={productData.category}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full appearance-none px-4 pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              >
                <option value="ELECTRONIC">Electronics</option>
                <option value="FURNITURE">Furniture</option>
                <option value="BEAUTY">Beauty</option>
                <option value="FASHION">Fashion</option>
                <option value="VEHICLES">Vehicle</option>
              </select>
              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Condition
            </label>
            <div className="relative">
              <select
                id="condition"
                name="condition"
                value={productData.condition}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full appearance-none px-4 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              >
                <option value="brand_new">New</option>
                <option value="used">Used</option>
              </select>
              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact
            </label>
            <div className="relative">
              <Phone
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="ownerContact"
                name="ownerContact"
                value={productData.ownerContact}
                onChange={handleChange}
                placeholder="Phone or email"
                inputMode="tel"
                disabled={isSubmitting}
                className="w-full px-4 pl-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pickup Location
            </label>
            <div className="relative">
              <MapPin
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="location"
                name="location"
                value={productData.location}
                onChange={handleChange}
                placeholder="Enter pickup location"
                disabled={isSubmitting}
                className="w-full px-4 pl-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>
      </form>

      {isSubmitting && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 z-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-base text-slate-700">
            {uploadProgress !== null
              ? `Uploading… ${uploadProgress}%`
              : "Uploading…"}
          </div>
        </div>
      )}
    </div>
  );
}

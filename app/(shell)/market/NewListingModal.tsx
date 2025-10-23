// NewListingModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Image as ImageIcon,
  DollarSign,
  Package,
  MapPin,
  ChevronDown,
  Phone,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { addProduct } from "@/repositories/MarketplaceRepository";

type NewListingModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewListingModal({ open, onClose }: NewListingModalProps) {
  const [productData, setProductData] = useState({
    name: "",
    category: "other",
    price: "",
    location: "",
    condition: "used",
    ownerContact: "",
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setProductData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...images, ...files].slice(0, 10); // up to 10
    setImages(next);

    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    setImagePreviews(next.map((f) => URL.createObjectURL(f)));

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    const nextImages = images.filter((_, i) => i !== idx);
    const nextPreviews = imagePreviews.filter((_, i) => i !== idx);
    URL.revokeObjectURL(imagePreviews[idx]);
    setImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  const resetForm = () => {
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    setProductData({
      name: "",
      category: "other",
      price: "",
      location: "",
      condition: "used",
      ownerContact: "",
      description: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
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
      // If your repository uses axios, this will show real upload progress.
      // Casting to any to avoid TS complaints if your function signature differs.
      await (addProduct as any)(formData, {
        onUploadProgress: (evt: any) => {
          if (!evt?.total) return;
          const pct = Math.round((evt.loaded / evt.total) * 100);
          setUploadProgress(pct);
        },
      });

      setSuccess(true);
      setUploadProgress(100);

      // Brief success state, then close
      setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
        setUploadProgress(null);
        onClose();
        setSuccess(false);
      }, 900);
    } catch (err: any) {
      console.error("Failed to add product:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to add product. Please try again.");
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const isValid =
    productData.name.trim() !== "" &&
    productData.price.trim() !== "" &&
    images.length > 0 &&
    !isSubmitting;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - disable close on click while submitting */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
        aria-busy={isSubmitting}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3 bg-slate-50">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-600 hover:bg-white/80 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-sm sm:text-base font-semibold text-slate-800">New listing</h2>

          <button
            type="button"
            onClick={() => isValid && handleSubmit()}
            disabled={!isValid}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B74E4] px-4 py-1.5 text-white text-sm font-semibold enabled:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {success ? (
              <>
                <CheckCircle size={16} />
                Posted
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Posting…
              </>
            ) : (
              <>Post your Product</>
            )}
          </button>
        </div>

        {/* Upload progress bar */}
        {uploadProgress !== null && (
          <div className="h-1 bg-slate-200">
            <div
              className="h-full bg-emerald-600 transition-[width] duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {/* Photos */}
            <div className="md:col-span-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-3 transition-colors disabled:opacity-60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                  <ImageIcon size={22} className="text-slate-600" />
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-medium text-slate-900">Add photos</div>
                  <div className="text-xs text-slate-500">JPG/PNG, up to 10 photos.</div>
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
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={src}
                        alt={`preview-${i}`}
                        className="w-full h-28 object-cover rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        disabled={isSubmitting}
                        className="absolute top-1.5 right-1.5 bg-slate-900/75 text-white p-1 rounded-full hover:bg-slate-900 shadow disabled:opacity-60"
                        aria-label="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2">
                  What are you selling?
                </label>
                <input
                  id="name"
                  name="name"
                  value={productData.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                />
              </div>

              <div>
                <textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your item"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none disabled:opacity-60"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="price"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    placeholder="Price"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  />
                </div>

                <div className="relative">
                  <Package
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    id="category"
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  >
                    <option value="ELECTRONIC">Electronics</option>
                    <option value="FURNITURE">Furniture</option>
                    <option value="BEAUTY">Beauty</option>
                    <option value="FASHION">Fashion</option>
                    <option value="VEHICLES">Vehicle</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <select
                    id="condition"
                    name="condition"
                    value={productData.condition}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  >
                    <option value="brand_new">New</option>
                    <option value="used">Used</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="ownerContact"
                    name="ownerContact"
                    value={productData.ownerContact}
                    onChange={handleChange}
                    placeholder="Contact (phone/email)"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Pickup location */}
              <div>
                <label className="block text-xs font-semibold tracking-wide text-slate-600 mb-2">
                  Pickup location
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="location"
                    name="location"
                    value={productData.location}
                    onChange={handleChange}
                    placeholder="Enter pickup location"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Submitting overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <div className="text-sm text-slate-700">
              {uploadProgress !== null ? `Uploading… ${uploadProgress}%` : "Uploading…"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
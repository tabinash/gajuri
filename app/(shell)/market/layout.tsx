"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Plus, X, Image as ImageIcon, DollarSign, Tag, Package } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

export default function MarketLayout({ children }: Props) {
  const pathname = usePathname();

  const tabs = [
    { label: "All listings", href: { pathname: "/market", query: { hide: "true" } } },
    { label: "Your listings", href: { pathname: "/market/your-items", query: { hide: "true" } } },
  ];

  // Modal + form state
  const [showModal, setShowModal] = useState(false);
  const [productData, setProductData] = useState({
    title: "",
    price: "",
    category: "other",
    condition: "used",
    description: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setProductData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const next = [...images, ...files].slice(0, 6);
    setImages(next);

    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = next.map((f) => URL.createObjectURL(f));
    setImagePreviews(previews);

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
      title: "",
      price: "",
      category: "other",
      condition: "used",
      description: "",
    });
    setImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...productData,
      images, // Files
    };
    console.log("New product listing:", payload);
    resetForm();
    setShowModal(false);
  };

  const isValid =
    productData.title.trim().length > 0 &&
    productData.price.trim().length > 0 &&
    images.length > 0;

  return (
    <section className="space-y-6">
      {/* Tabs + Add Product */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/market" && pathname.startsWith(tab.href.pathname));
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`-mb-px pb-3 text-sm transition-colors ${
                    isActive
                      ? "border-b-2 border-slate-900 font-semibold text-slate-900"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus size={16} />
            Add product
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-slate-900">Add a product</h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Title *
                </label>
                <div className="relative">
                  <Tag size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="title"
                    name="title"
                    value={productData.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. iPhone 13, Wooden desk, Textbooks set"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="price"
                      name="price"
                      value={productData.price}
                      onChange={handleChange}
                      required
                      placeholder="e.g. 15000"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      id="category"
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="books">Books</option>
                      <option value="fashion">Fashion</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-slate-700 mb-2">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={productData.condition}
                  onChange={handleChange}
                  className="w-full py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white"
                >
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="used">Used</option>
                  <option value="for-parts">For parts</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add details about the product, any defects, what’s included, etc."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Images */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Images *</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800"
                  >
                    <ImageIcon size={16} />
                    Add images ({images.length}/6)
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>

                {imagePreviews.length > 0 && (
                  <div
                    className={`grid gap-2 ${
                      imagePreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-44 object-cover rounded-lg border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-2 right-2 bg-slate-900/70 text-white p-1.5 rounded-full hover:bg-slate-900"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500">Up to 6 images. JPG/PNG recommended.</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
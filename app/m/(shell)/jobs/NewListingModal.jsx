"use client";

import React, { useState } from "react";
import { X, ChevronDown, MapPin } from "lucide-react";
import { Loader2, CheckCircle } from "lucide-react";
import { createJob } from "@/repositories/JobRepository";

export default function NewJobPostingModal({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [description, setDescription] = useState("");
  const [jobType, setJobType] = useState("");

  // API UX state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const isValid = title.trim().length > 0 && description.trim().length > 0 && !isSubmitting;

  const resetForm = () => {
    setTitle("");
    setSalary("");
    setLocation("");
    setContactInfo("");
    setDescription("");
    setJobType("");
  };

  const handleNext = async () => {
    if (!isValid) return;
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      salary: salary.trim(),
      location: location.trim(),
      contactInfo: contactInfo.trim(),
      description: description.trim(),
      jobType: jobType.trim(),
    };

    try {
      const res = await createJob(payload);
      console.log("Job created:", res?.data ?? res);
      setSuccess(true);

      // brief success state then close
      setTimeout(() => {
        resetForm();
        setIsSubmitting(false);
        setSuccess(false);
        onClose();
      }, 800);
    } catch (e) {
      console.error("Error creating job:", e);
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to post job. Please try again.";
      setError(msg);
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop (block close while submitting) */}
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[500px] max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
        aria-busy={isSubmitting}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <h2 className="text-base font-semibold text-slate-800">Post a job</h2>

          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B74E4] px-4 py-1.5 text-white text-sm font-semibold enabled:hover:bg-[#1B74E9] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <>Next</>
            )}
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          <div>
            <div className="text-[15px] font-semibold text-slate-800 mb-3">Job details</div>

            <div className="space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job title (e.g., Software Engineer)"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Job description, responsibilities, and requirements"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none disabled:opacity-60"
              />

              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Salary (Rs... )"
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                />

                <div className="relative">
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
                  >
                    <option value="" disabled>
                      Job Type
                    </option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <input
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Contact information (email or phone)"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Location */}
          <div className="pt-2">
            <div className="text-[15px] font-semibold text-slate-800 mb-3">Job location</div>
            <div className="relative">
              <MapPin
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter job location"
                disabled={isSubmitting}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Submitting overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <div className="text-sm text-slate-700">Posting job…</div>
          </div>
        )}
      </div>
    </div>
  );
}
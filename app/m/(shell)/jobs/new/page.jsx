"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  MapPin,
  Phone,
  Briefcase,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { createJob } from "@/repositories/JobRepository";

export default function NewJobPage() {
  const router = useRouter();
  const [jobData, setJobData] = useState({
    title: "",
    salary: "",
    location: "",
    contactInfo: "",
    description: "",
    jobType: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setJobData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const payload = {
      title: jobData.title.trim(),
      salary: jobData.salary.trim(),
      location: jobData.location.trim(),
      contactInfo: jobData.contactInfo.trim(),
      description: jobData.description.trim(),
      jobType: jobData.jobType.trim(),
    };

    try {
      const res = await createJob(payload);
      console.log("Job created:", res?.data ?? res);
      setSuccess(true);

      setTimeout(() => {
        router.push("/m/jobs");
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

  const isValid =
    jobData.title.trim().length > 0 &&
    jobData.description.trim().length > 0 &&
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

          <h1 className="text-lg font-semibold text-slate-900">Post a Job</h1>

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

      <form onSubmit={handleSubmit} className="pb-6">
        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="px-4 py-5 space-y-5">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Title *
            </label>
            <div className="relative">
              <Briefcase
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                disabled={isSubmitting}
                className="w-full px-4 pl-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Job description, responsibilities, and requirements"
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none disabled:opacity-60"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Salary
            </label>
            <div className="relative">
             
              <input
                id="salary"
                name="salary"
                value={jobData.salary}
                onChange={handleChange}
                placeholder="e.g., Rs 50,000 per month"
                inputMode="numeric"
                disabled={isSubmitting}
                className="w-full px-4 pl-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Type
            </label>
            <div className="relative">
              <select
                id="jobType"
                name="jobType"
                value={jobData.jobType}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full appearance-none px-4 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              >
                <option value="">Select job type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="remote">Remote</option>
              </select>
              <ChevronDown
                size={20}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="location"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                placeholder="Enter job location"
                disabled={isSubmitting}
                className="w-full px-4 pl-10 py-3 bg-white border border-slate-300 rounded-lg text-base text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Contact Information
            </label>
            <div className="relative">
              <Phone
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="contactInfo"
                name="contactInfo"
                value={jobData.contactInfo}
                onChange={handleChange}
                placeholder="Email or phone number"
                inputMode="tel"
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
          <div className="text-base text-slate-700">Posting job…</div>
        </div>
      )}
    </div>
  );
}

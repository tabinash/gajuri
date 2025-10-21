"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { Plus, X, Briefcase, MapPin, DollarSign, Clock, Phone } from "lucide-react";
import { createJob } from "@/repositories/JobRepository";

type Props = {
  children: React.ReactNode;
};

export default function JobLayout({ children }: Props) {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    salary: "",
    location: "",
    contacts: "",
    description: "",
    jobType: "full_time",
  });

  const tabs = [
    {
      label: "Job Opportunities",
      href: { pathname: "/jobs", query: { hide: "true" } },
    },
    {
      label: "Your Job Posts",
      href: { pathname: "/jobs/your-jobs", query: { hide: "true" } },
    },
  ];

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    console.log("Job submitted:", jobData);
    const response = await createJob(jobData);
    console.log("Job creation response:", response);
    // Reset and close
    setJobData({
      title: "",
      salary: "",
      location: "",
      contacts: "",
      description: "",
      jobType: "full-time",
    });
    setShowModal(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setJobData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section className="space-y-6">
      {/* Tabs with Add Job Button */}
      <div className="border-b border-slate-200 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => {
              const isActive =
                pathname === tab.href.pathname ||
                (tab.href.pathname !== "/jobs" &&
                  pathname.startsWith(tab.href.pathname));

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

          {/* Add Job Button */}
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>
      </div>

      {/* Content */}
      <div>{children}</div>

      {/* Add Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-slate-900">Post a Job</h2>
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
              {/* Job Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                  Job Title *
                </label>
                <div className="relative">
                  <Briefcase
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={jobData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      required
                      value={jobData.location}
                      onChange={handleChange}
                      placeholder="e.g. Kathmandu, Nepal"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-slate-700 mb-2">
                    Salary
                  </label>
                  <div className="relative">
 
                    <input
                      type="text"
                      id="salary"
                      name="salary"
                      value={jobData.salary}
                      onChange={handleChange}
                      placeholder="NPR"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Job Type & Contacts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jobType" className="block text-sm font-medium text-slate-700 mb-2">
                    Job Type *
                  </label>
                  <div className="relative">
                    <Clock
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <select
                      id="jobType"
                      name="jobType"
                      required
                      value={jobData.jobType}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none bg-white"
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contacts" className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Information *
                  </label>
                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      id="contacts"
                      name="contacts"
                      required
                      value={jobData.contacts}
                      onChange={handleChange}
                      placeholder="Phone/Email"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                  Job Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={jobData.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the job role, responsibilities, requirements, and qualifications..."
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
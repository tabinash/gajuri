"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  MapPin,
  Building2,
  Phone,
  Briefcase,
} from "lucide-react";
import { getJobById, jobClosed } from "@/repositories/JobRepository";
import { conversationRepository } from "@/repositories/conversationRepository";
import { useCurrentUser } from "@/hooks";
import { relativeTimeFromISO, formatSalary } from "@/utils";

function fromApi(j) {
  return {
    id: String(j.id),
    title: j.title || "Untitled role",
    company: j.username || "Unknown",
    logo: j.profilePicture,
    location: j.location || "—",
    type: j.jobType,
    salary: formatSalary(j.salary),
    posted: relativeTimeFromISO(j.createdAt),
    description: j.description || "",
    category: j.category || undefined,
    open: typeof j.open === "boolean" ? j.open : undefined,
    contactNo: j.contactNo || undefined,
    secondContactNo: j.ownerPhoneNumber || undefined,
    userId: j.userId,
  };
}

function CompanyLogo({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-16 w-16 shrink-0 rounded-lg object-cover border border-slate-200"
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/80/EEE/94A3B8?text=Logo";
        }}
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-lg font-semibold text-white">
      {initials}
    </div>
  );
}

export default function JobDetailPage({ params }) {
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const { user: userData, userId } = useCurrentUser();
  const isOwner = userData && job && String(userData.id) === String(job.userId);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await getJobById(params.id);
        console.log("Fetched job:", response.data);
        setJob(fromApi(response.data));
      } catch (err) {
        console.error("Failed to load job:", err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [params.id]);

  const handleCloseJob = async () => {
    if (!job || updating) return;

    setUpdating(true);
    setError(null);
    try {
      await jobClosed(job.id);
      const response = await getJobById(params.id);
      setJob(fromApi(response.data));
      setError(null);
    } catch (err) {
      console.error("Failed to close job:", err);
      setError("Failed to update job status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !job || sendingMessage) return;

    setSendingMessage(true);
    setMessageStatus(null);
    try {
      const jobInfo = ` Job: ${job.title}\n Company: ${job.company}\n Location: ${job.location}\n${job.salary ? ` Salary: ${job.salary}\n` : ''}${job.type ? ` Type: ${job.type}\n` : ''}\n`;
      const fullMessage = trimmed + "\n\n" + jobInfo;

      const response = await conversationRepository.sendMessage({
        receiverId: Number(job.userId),
        content: fullMessage,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      setMessage("");
      setMessageStatus({ type: "success", text: "Message sent successfully!" });
      setTimeout(() => setMessageStatus(null), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageStatus({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setSendingMessage(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => router.back()} className="p-1 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Job Details</h1>
        </div>

        {/* Loading skeleton */}
        <div className="animate-pulse p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button onClick={() => router.back()} className="p-1 rounded-full active:bg-slate-100">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold text-slate-900">Job Details</h1>
        </div>
        <div className="p-8 text-center text-slate-500">
          <p>Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-slate-100" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">Job Details</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Company Header */}
        <div className="flex items-start gap-3 pb-4 border-b border-slate-200">
          <CompanyLogo src={job.logo} name={job.company} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h2>
              {job.open !== undefined && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    job.open
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {job.open ? "Open" : "Closed"}
                </span>
              )}
            </div>
            <div className="mt-1 text-base font-semibold text-slate-700">{job.company}</div>
            <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={14} />
              {job.location}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">{job.posted}</div>
          </div>
        </div>

        {/* Job Meta */}
        <div className="mt-4 flex flex-wrap gap-2">
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              {job.salary}
            </span>
          )}
          {job.type && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
              <Briefcase size={14} />
              {job.type}
            </span>
          )}
          {job.category && (
            <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700">
              {job.category}
            </span>
          )}
        </div>

        {/* Description */}
        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">Job Description</h3>
          <div className="mt-2 text-base leading-relaxed text-slate-700 whitespace-pre-line">
            {job.description || "No description provided."}
          </div>
        </div>

        {/* About Employer */}
        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-900">About the Employer</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <span>{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              <span>{job.location}</span>
            </div>
            {job.contactNo && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <a
                  href={`tel:${job.contactNo}`}
                  className="text-blue-600 active:underline"
                >
                  {job.contactNo}
                </a>
              </div>
            )}
            {job.secondContactNo && (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-slate-400" />
                <a
                  href={`tel:${job.secondContactNo}`}
                  className="text-blue-600 active:underline"
                >
                  {job.secondContactNo}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
        {isOwner ? (
          <div>
            {job.open ? (
              <button
                onClick={handleCloseJob}
                disabled={updating}
                className="w-full rounded-lg bg-red-600 px-6 py-3 text-base font-semibold text-white active:bg-red-700 transition-colors disabled:opacity-50"
              >
                {updating ? "Closing..." : "Close Job"}
              </button>
            ) : (
              <div className="text-center text-sm text-slate-500 py-2">
                This job has been closed
              </div>
            )}
            {error && (
              <div className="mt-2 text-sm text-center text-red-600">{error}</div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Apply for this job</div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={sendingMessage}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sendingMessage || !message.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white active:bg-blue-700 disabled:opacity-50 shrink-0"
              >
                {sendingMessage ? "Sending..." : <><Send size={16} /> Send</>}
              </button>
            </form>
            {messageStatus && (
              <div className={`mt-2 text-xs text-center ${messageStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {messageStatus.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Send,
  MapPin,
  Building2,
  Phone,
  ChevronLeft,
} from "lucide-react";
import { getJobById, jobClosed } from "@/repositories/JobRepository";
import { conversationRepository } from "@/repositories/conversationRepository";
import { useRouter } from "next/navigation";

function relativeTimeFromISO(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["min", 60],
  ];
  for (const [label, sec] of units) {
    const v = Math.floor(diffSec / sec);
    if (v >= 1) return `${v} ${label}${v > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function formatSalary(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return undefined;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "NPR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `Rs ${n}`;
  }
}

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

export default function JobDetailPage({ params }) {
  const [job, setJob] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);
  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");

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
      // Format message with job information
      const jobInfo = ` Job: ${job.title}\n Company: ${job.company}\n Location: ${job.location}\n${job.salary ? ` Salary: ${job.salary}\n` : ''}${job.type ? ` Type: ${job.type}\n` : ''}\n`;
      const fullMessage = trimmed+ "\n\n" +jobInfo ;

      const response = await conversationRepository.sendMessage({
        receiverId: Number(job.userId),
        content: fullMessage,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to send message");
      }

      setMessage("");
      setMessageStatus({ type: "success", text: "Message sent successfully!" });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessageStatus(null), 3000);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageStatus({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-base text-slate-600">
          Loading job details...
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="text-base text-slate-600">
            No job found. Please select a job from the{" "}
            <Link href="/jobs" className="text-blue-600 hover:underline">
              Jobs page
            </Link>
            .
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-12 gap-4 p-8">
       <div className="col-span-12 mb-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      {/* Left: details */}
      <div className="col-span-12 space-y-4 lg:col-span-7">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold leading-6 text-slate-900">
                {job.title}
              </h1>

              <div className="mt-1 text-sm text-slate-500">{job.posted}</div>
            </div>
            <div className="flex items-center gap-2">
              {job.open !== undefined && (
                <span
                  className={`rounded-full px-2 py-1 text-sm font-medium ${
                    job.open
                      ? "bg-emerald-50 text-[#1B74E4]"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {job.open ? "Open" : "Closed"}
                </span>
              )}
            </div>
          </div>

          {job.salary && (
            <div className="mt-3 inline-flex rounded-full  px-2.5 py-1 text-base font-medium text-gray-600">
              {job.salary}
            </div>
          )}

          {job.type && (
            <div className="mt-3 inline-flex rounded-full  px-2.5 py-1 text-base font-medium text-gray-700 ml-2">
              {job.type}
            </div>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {job.category && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                {job.category}
              </span>
            )}
          </div>

          <div className="mt-4 whitespace-pre-line text-base leading-normal text-slate-800">
            {job.description}
          </div>
        </div>
      </div>

      {/* Right: company + contact/apply */}
      <div className="col-span-12 space-y-4 lg:col-span-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <CompanyLogo src={job.logo} name={job.company} />
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                {job.company}
              </div>
              <div className="truncate text-sm text-slate-500">
                {job.location}
              </div>
            </div>
          </div>

          <div className="mt-4">
            {isOwner ? (
              <div className="flex-1">
                {job.open ? (
                  <button
                    onClick={handleCloseJob}
                    disabled={updating}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-base font-medium text-white shadow-sm 
                    bg-rose-500 hover:bg-rose-600 
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updating ? "Updating..." : "Close Job"}
                  </button>
                ) : (
                  <div className="w-full text-center text-base text-gray-500">
                    This job has been closed.
                  </div>
                )}

                {error && (
                  <div className="mt-2 text-sm text-rose-600">{error}</div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-3 text-base font-semibold text-slate-900">Apply for this job</div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sendingMessage}
                    className="flex-1 rounded-full border border-slate-200 px-3 py-2 text-base outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !message.trim()}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-500 px-3 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingMessage ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send size={16} /> Send
                      </>
                    )}
                  </button>
                </form>
                
                {messageStatus && (
                  <div className={`mt-2 text-sm ${messageStatus.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {messageStatus.text}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="text-base font-semibold text-slate-900">
            About the employer
          </div>
          <div className="mt-3 space-y-2 text-base text-slate-700">
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
                  className="text-blue-600 hover:underline"
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
                  className="text-blue-600 hover:underline"
                >
                  {job.secondContactNo}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyLogo({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200"
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
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-200 text-base font-semibold text-slate-700 ring-1 ring-slate-200">
      {initials}
    </div>
  );
}
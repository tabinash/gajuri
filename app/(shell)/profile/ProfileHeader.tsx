"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapPin, CalendarDays, Mail, Phone, Globe, CheckCircle2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { getUserProfileById } from "@/repositories/UserRepository";

type ApiUser = {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  district?: string;
  palika?: string;
  ward?: string;
  institutionCategory?: string;
  institutionalUser?: boolean;
  website?: string;
  verified?: boolean;
  profilePhotoUrl?: string;
  coverPhotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

function formatJoined(date?: string) {
  if (!date) return undefined;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function normalizeWebsite(url?: string) {
  if (!url) return undefined;
  const hasScheme = /^https?:\/\//i.test(url);
  const href = hasScheme ? url : `https://${url}`;
  try {
    const u = new URL(href);
    return { href, label: u.host.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname) };
  } catch {
    return { href, label: url };
  }
}

function buildLocation(u?: ApiUser) {
  if (!u) return undefined;
  const parts = [u.palika, u.district].filter(Boolean).join(", ");
  if (u.ward) return parts ? `${parts} — Ward ${u.ward}` : `Ward ${u.ward}`;
  return parts || undefined;
}

export default function ProfileHeader({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userData = JSON.parse(localStorage.getItem("chemiki-userProfile") || "null");
  const isOwnProfile = Number(userData?.id) === Number(userId);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserProfileById(userId);
        if (!ignore) setProfile(res?.data ?? null);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load profile");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (userId) run();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const joined = useMemo(() => formatJoined(profile?.createdAt), [profile?.createdAt]);
  const location = useMemo(() => buildLocation(profile || undefined), [profile]);
  const website = useMemo(() => normalizeWebsite(profile?.website), [profile?.website]);

  // Save profile data to localStorage before navigating to edit page
  const handleEditProfile = () => {
    if (profile) {
      const editData = {
        id: profile.id,
        username: profile.username,
        email: profile.email,
        phoneNumber: profile.phoneNumber || "",
        dateOfBirth: profile.dateOfBirth || "",
        district: profile.district || "",
        palika: profile.palika || "",
        ward: profile.ward || "",
        institutionCategory: profile.institutionCategory || "",
        institutionalUser: profile.institutionalUser || false,
        website: profile.website || "",
        profilePhotoUrl: profile.profilePhotoUrl || "",
        coverPhotoUrl: profile.coverPhotoUrl || "",
      };
      
      localStorage.setItem("chemiki-editProfileData", JSON.stringify(editData));
    }
  };

  // Fallback images
  const coverSrc =
    profile?.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80";

  const avatarSrc =
    profile?.profilePhotoUrl ||
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=160&q=80";

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Cover */}
      <div className="relative h-40 w-full">
        <img
          src={coverSrc}
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/1600x200/EDF2F7/94A3B8?text=Cover";
          }}
        />
      </div>

      {/* Profile Details */}
      <div className="relative px-6 pb-8">
        {/* Avatar */}
        <div className="absolute -top-10 left-6">
          <img
            src={avatarSrc}
            alt={`${profile?.username ?? "User"} avatar`}
            className="h-20 w-20 rounded-full border-4 border-white object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/160/EEE/94A3B8?text=Avatar";
            }}
          />
        </div>

        {/* Actions */}
        <div className="mt-3 flex justify-end">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              onClick={handleEditProfile}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-slate-50"
            >
              Edit profile
            </Link>
          ) : (
            <Link
              href={`/message?userId=${profile?.id ?? userId}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:brightness-95"
              aria-label="Message user"
            >
              <MessageCircle size={16} />
              Message
            </Link>
          )}
        </div>

        {/* Info */}
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">
              {profile?.username || (loading ? "Loading..." : "Unknown User")}
            </h1>
            {profile?.verified && (
              <CheckCircle2 size={18} className="text-green-600" aria-label="Verified" />
            )}
            {profile?.institutionalUser && (
              <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {profile.institutionCategory || "Institutional"}
              </span>
            )}
          </div>

          {profile?.email && <p className="text-slate-600">{profile.email}</p>}

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {location && (
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                <span className="truncate">{location}</span>
              </li>
            )}

            {joined && (
              <li className="flex items-center gap-2">
                <CalendarDays size={16} className="text-slate-500" />
                <span>Joined {joined}</span>
              </li>
            )}

            {profile?.email && (
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-slate-500" />
                <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                  {profile.email}
                </a>
              </li>
            )}

            {profile?.phoneNumber && (
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-slate-500" />
                <a href={`tel:${profile.phoneNumber}`} className="text-blue-600 hover:underline">
                  {profile.phoneNumber}
                </a>
              </li>
            )}

            {website && (
              <li className="flex items-center gap-2">
                <Globe size={16} className="text-slate-500" />
                <a
                  href={website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {website.label}
                </a>
              </li>
            )}
          </ul>

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
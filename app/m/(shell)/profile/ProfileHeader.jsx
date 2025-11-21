"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Mail,
  Phone,
  Globe,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { getUserProfileById } from "@/repositories/UserRepository";
import { useCurrentUser } from "@/hooks";

function formatJoined(date) {
  if (!date) return undefined;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeWebsite(url) {
  if (!url) return undefined;
  const hasScheme = /^https?:\/\//i.test(url);
  const href = hasScheme ? url : `https://${url}`;
  try {
    const u = new URL(href);
    return {
      href,
      label:
        u.host.replace(/^www\./, "") +
        (u.pathname === "/" ? "" : u.pathname),
    };
  } catch {
    return { href, label: url };
  }
}

function buildLocation(u) {
  if (!u) return undefined;
  const parts = [u.palika, u.district].filter(Boolean).join(", ");
  if (u.ward) return parts ? `${parts} — Ward ${u.ward}` : `Ward ${u.ward}`;
  return parts || undefined;
}

export default function ProfileHeader({ userId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId: currentUserId } = useCurrentUser();
  const isOwnProfile = Number(currentUserId) === Number(userId);

  useEffect(() => {
    let ignore = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserProfileById(userId);
        if (!ignore) setProfile(res?.data ?? null);
      } catch (e) {
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

  const coverSrc =
    profile?.coverPhotoUrl ||
    "https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1600&q=80";

  const avatarSrc =
    profile?.profilePhotoUrl ||
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=160&q=80";

  if (loading) {
    return (
      <section className="overflow-hidden bg-white animate-pulse border-b border-slate-200 mb-2">
        {/* Cover skeleton */}
        <div className="h-40 w-full bg-slate-200" />

        {/* Content skeleton */}
        <div className="px-4 pb-5">
          {/* Avatar & Button row */}
          <div className="flex items-end justify-between -mt-14">
            <div className="h-28 w-28 rounded-full border-4 border-white bg-slate-200" />
            <div className="mb-1 h-8 w-24 rounded-lg bg-slate-200" />
          </div>

          {/* Name & bio */}
          <div className="mt-3 space-y-2">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>

          {/* Metadata */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden bg-white border-b border-slate-200">
        <div className="p-6 text-center">
          <p className="text-base font-semibold text-red-600">Failed to load profile</p>
          <p className="mt-1 text-sm text-slate-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden bg-white border-b-4 border-slate-200 mb-2">
      <div className="relative h-62 w-full">
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

      <div className="relative px-4 pb-6">
        <div className="absolute -top-12 left-4">
          <img
            src={avatarSrc}
            alt={`${profile?.username ?? "User"} avatar`}
            className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/160/EEE/94A3B8?text=Avatar";
            }}
          />
        </div>

        <div className="mt-4 flex justify-end">
          {isOwnProfile ? (
            <Link
              href="/m/profile/edit"
              onClick={handleEditProfile}
              className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold active:bg-slate-50"
            >
              Edit profile
            </Link>
          ) : (
            <Link
              href={`/m/message?userId=${profile?.id ?? userId}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white active:bg-emerald-700"
              aria-label="Message user"
            >
              <MessageCircle size={16} />
              Message
            </Link>
          )}
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {profile?.username || "Unknown User"}
            </h1>
            {profile?.verified && (
              <CheckCircle2 size={20} className="text-blue-600" aria-label="Verified" />
            )}
            {profile?.institutionalUser && (
              <span className="ml-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                {profile.institutionCategory || "Institutional"}
              </span>
            )}
          </div>

          {profile?.email && <p className="mt-1 text-sm text-slate-600">{profile.email}</p>}

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {location && (
              <li className="flex items-center gap-2.5">
                <MapPin size={16} className="text-slate-500 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </li>
            )}

            {joined && (
              <li className="flex items-center gap-2.5">
                <CalendarDays size={16} className="text-slate-500 flex-shrink-0" />
                <span>Joined {joined}</span>
              </li>
            )}

            {profile?.email && (
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-slate-500 flex-shrink-0" />
                <a
                  href={`mailto:${profile.email}`}
                  className="text-blue-600 hover:underline truncate"
                >
                  {profile.email}
                </a>
              </li>
            )}

            {profile?.phoneNumber && (
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-slate-500 flex-shrink-0" />
                <a
                  href={`tel:${profile.phoneNumber}`}
                  className="text-blue-600 hover:underline"
                >
                  {profile.phoneNumber}
                </a>
              </li>
            )}

            {website && (
              <li className="flex items-center gap-2.5">
                <Globe size={16} className="text-slate-500 flex-shrink-0" />
                <a
                  href={website.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {website.label}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

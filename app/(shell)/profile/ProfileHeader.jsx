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
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white animate-pulse">
        <div className="h-40 w-full bg-slate-200" />
        <div className="relative px-6 pb-8">
          <div className="absolute -top-10 left-6">
            <div className="h-20 w-20 rounded-full border-4 border-white bg-slate-200" />
          </div>
          <div className="mt-3 flex justify-end">
            <div className="h-8 w-24 rounded-md bg-slate-200" />
          </div>
          <div className="mt-10 space-y-4">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="h-4 w-56 rounded bg-slate-200" />
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-200" />
                <div className="h-4 w-40 rounded bg-slate-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-slate-200" />
                <div className="h-4 w-44 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="overflow-hidden rounded-2xl border border-red-200 bg-white">
        <div className="p-8 text-center">
          <p className="text-lg font-semibold text-red-600">Failed to load profile</p>
          <p className="mt-1 text-sm text-slate-600">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

      <div className="relative px-6 pb-8">
        <div className="absolute -top-10 left-6">
          <img
            src={avatarSrc}
            alt={`${profile?.username ?? "User"} avatar`}
            className="h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/160/EEE/94A3B8?text=Avatar";
            }}
          />
        </div>

        <div className="mt-3 flex justify-end">
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              onClick={handleEditProfile}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 transition-colors"
            >
              Edit profile
            </Link>
          ) : (
            <Link
              href={`/message?userId=${profile?.id ?? userId}`}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              aria-label="Message user"
            >
              <MessageCircle size={16} />
              Message
            </Link>
          )}
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {profile?.username || "Unknown User"}
            </h1>
            {profile?.verified && (
              <CheckCircle2 size={20} className="text-green-600" aria-label="Verified" />
            )}
            {profile?.institutionalUser && (
              <span className="ml-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                {profile.institutionCategory || "Institutional"}
              </span>
            )}
          </div>

          {profile?.email && <p className="mt-1 text-slate-600">{profile.email}</p>}

          <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
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

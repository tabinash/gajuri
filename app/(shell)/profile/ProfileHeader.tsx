"use client";

import React, { useState } from "react";
import { MapPin, CalendarDays, Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";

type User = {
  name: string;
  email: string;
  avatar: string;
  cover: string;
  location: string;
  joined: string;
  phone: string;
  website: string;
};

export default function ProfileHeader() {
  const [user] = useState<User>({
    name: "Abishek Tiwari",
    email: "oli@gmail.com",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    cover:
      "https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1600&auto=format&fit=crop",
    location: "Kathmandu, Kathmandu Metropolitan City - Ward No. Ward No. 15",
    joined: "Sep 20, 2025",
    phone: "9813278824",
    website: "gajuri.app",
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Cover */}
      <div className="relative h-40 w-full">
        <img
          src={user.cover}
          alt="Cover"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Profile Details */}
      <div className="relative px-6 pb-8">
        {/* Avatar */}
        <div className="absolute -top-10 left-6">
          <img
            src={user.avatar}
            alt="Avatar"
            className="h-20 w-20 rounded-full border-4 border-white object-cover"
          />
        </div>

        {/* Edit Button → now links to edit page */}
        <div className="mt-3 flex justify-end">
          <Link
            href="/profile/edit"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-slate-50"
          >
            Edit profile
          </Link>
        </div>

        {/* Info */}
        <div className="mt-10">
          <h1 className="text-xl font-semibold text-slate-900">{user.name}</h1>
          <p className="text-slate-600">{user.email}</p>

          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-slate-500" />
              <span>{user.location}</span>
            </li>
            <li className="flex items-center gap-2">
              <CalendarDays size={16} className="text-slate-500" />
              <span>Joined {user.joined}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-slate-500" />
              <a
                href={`mailto:${user.email}`}
                className="text-blue-600 hover:underline"
              >
                {user.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-slate-500" />
              <a
                href={`tel:${user.phone}`}
                className="text-blue-600 hover:underline"
              >
                {user.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Globe size={16} className="text-slate-500" />
              <a
                href={`https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {user.website}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

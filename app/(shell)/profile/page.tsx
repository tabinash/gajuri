"use client";

import React, { useState } from "react";
import PostCard, { type Post } from "../feed/PostCard";
import PostDetailModal from "../feed/PostDetailModal";
import ProfileHeader from "./ProfileHeader";

const posts: Post[] = [
  {
    name: "Abinash",
    neighborhood: "Maple Grove",
    time: "1h ago",
    text:
      "Wrapped up a quick UI pass on the profile page header today. Next up: polishing the About section and adding a share card.",
    likes: 5,
    comments: 2,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1520975928316-56c93f5f3c5d?q=80&w=1200&auto=format&fit=crop", alt: "Work desk" },
    ],
  },
  {
    name: "Abinash",
    neighborhood: "Maple Grove",
    time: "Yesterday",
    text:
      "Neighborhood meetup was great! Thanks everyone who joined — loved the conversations and snacks.",
    likes: 18,
    comments: 4,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
  },
];

export default function ProfilePostsPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);

  return (
    <>
        <ProfileHeader />
      <section className="space-y-3">
        {posts.map((p, i) => (
          <PostCard
            key={i}
            {...p}
            onOpen={() => {
              setSelected(p);
              setOpen(true);
            }}
            onComment={() => {
              setSelected(p);
              setOpen(true);
            }}
          />
        ))}
      </section>

      <PostDetailModal open={open} onClose={() => setOpen(false)} post={selected} />
    </>
  );
}

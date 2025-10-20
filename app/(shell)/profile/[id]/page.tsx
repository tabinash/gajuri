"use client";

import React, { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import PostCard, { type Post } from "../../feed/PostCard";
import PostDetailModal from "../../feed/PostDetailModal";

function useUserFromPath() {
  const pathname = usePathname();
  const id = pathname?.split("/")[2] ?? "user";
  const name = id
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
  return { id, name };
}

export default function OtherProfilePostsPage() {
  const { name } = useUserFromPath();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);

  const posts = useMemo<Post[]>(
    () => [
      {
        name,
        neighborhood: "Willow Creek",
        time: "2h ago",
        text:
          "Appreciate the recommendations for local plumbers — got the leak fixed quickly!",
        likes: 9,
        comments: 3,
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
        images: [
          {
            src: "https://images.unsplash.com/photo-1520975928316-56c93f5f3c5d?q=80&w=1200&auto=format&fit=crop",
            alt: "Kitchen sink",
          },
        ],
      },
      {
        name,
        neighborhood: "Willow Creek",
        time: "1d ago",
        text:
          "Heads up, there’s a yard sale on Elm St this Saturday morning. Lots of kids’ items!",
        likes: 17,
        comments: 5,
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
      },
    ],
    [name]
  );

  return (
    <>
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

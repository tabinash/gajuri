// ...existing code...
"use client";

import React, { useState } from "react";
import PostCard, { type Post } from "./PostCard";
import PostDetailModal from "./PostDetailModal";

const posts: Post[] = [
  {
    name: "Jennifer Shields",
    neighborhood: "Burke Centre Landings",
    time: "51 min ago",
    text:
      "Was anyone at the 11 am mass at Nativity Church in Burke today, and do you know what went on? In the middle of Mass, lectors escorted a man who was seated in one of the front pews and afterwards there was a police presence outside the church. The person escorted out did NOT appear to be ill.",
    likes: 1,
    comments: 3,
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Marcus Lee",
    neighborhood: "Old Town Square",
    time: "2h ago",
    text:
      "Lost keys on Maple Ave near the library. Black Toyota key fob with a silver keychain. Please DM if found.",
    likes: 4,
    comments: 6,
    avatar:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1520975928316-56c93f5f3c5d?q=80&w=1200&auto=format&fit=crop", alt: "Street near library" },
    ],
  },
  {
    name: "Priya N.",
    neighborhood: "Greenfield",
    time: "3h ago",
    text:
      "Free moving boxes available! Various sizes, clean and sturdy. Porch pickup this evening.",
    likes: 7,
    comments: 2,
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1493673272479-a20888bcee10?q=80&w=800&auto=format&fit=crop", alt: "Moving boxes 1" },
      { src: "https://images.unsplash.com/photo-1582582621959-48d2838c7b5e?q=80&w=800&auto=format&fit=crop", alt: "Moving boxes 2" },
      { src: "https://images.unsplash.com/photo-1483181957632-8bda974b3d6b?q=80&w=800&auto=format&fit=crop", alt: "Moving boxes 3" },
    ],
  },
  {
    name: "Alex Chen",
    neighborhood: "Riverside",
    time: "5h ago",
    text:
      "Heads up: there’s a temporary road closure on Pine St due to utility work. Expect delays through tomorrow.",
    likes: 2,
    comments: 1,
    avatar:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1501696461415-6bd6660c6743?q=80&w=1200&auto=format&fit=crop", alt: "Road work 1" },
      { src: "https://images.unsplash.com/photo-1581093588401-16ec8a2f2eb0?q=80&w=1200&auto=format&fit=crop", alt: "Road work 2" },
      { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop", alt: "Detour sign" },
    ],
  },
  {
    name: "Sophia Martinez",
    neighborhood: "Willow Creek",
    time: "6h ago",
    text:
      "Anyone have recommendations for a reliable plumber who can come out today or tomorrow? We’ve got a small leak under our kitchen sink.",
    likes: 5,
    comments: 9,
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Daniel Brooks",
    neighborhood: "Hilltop Gardens",
    time: "8h ago",
    text:
      "Big thanks to whoever turned in my lost wallet at the community center! Everything was still inside — faith in humanity restored.",
    likes: 14,
    comments: 4,
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Lara Jensen",
    neighborhood: "Maple Grove",
    time: "10h ago",
    text:
      "Does anyone know if the farmer’s market will still be open this Saturday given the forecasted rain? Really hoping to pick up some fresh apples and honey.",
    likes: 3,
    comments: 2,
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a2c9f9?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1000&auto=format&fit=crop", alt: "Farmer’s market stall" },
      { src: "https://images.unsplash.com/photo-1572448862528-9e6b81e57b0a?q=80&w=1000&auto=format&fit=crop", alt: "Apples and honey" },
    ],
  },
  {
    name: "Ethan Brown",
    neighborhood: "Lakeview Heights",
    time: "1d ago",
    text:
      "Beautiful sunset over the lake tonight 🌅 Anyone else catch it? This neighborhood never disappoints!",
    likes: 22,
    comments: 10,
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
    images: [
      { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop", alt: "Sunset over the lake" },
      { src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop", alt: "Evening reflections" },
    ],
  },
];


export default function FeedPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);

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
// ...existing code...
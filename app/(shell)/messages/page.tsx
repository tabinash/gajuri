"use client";

import ChatThread from "./ChatThread";

export default function MessageThreadPage({ params }: { params: { id: string } }) {
  // Map the id to a display name/avatar as needed
  const name = decodeURIComponent(params.id).replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const avatar =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop";
  return <ChatThread name={name} avatar={avatar} />;
}
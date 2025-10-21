"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationRepository } from "@/repositories/conversationRepository";
import ChatList from "./ChatList";
import ChatThread from "./ChatThread";

function MessagesContent() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams?.get("userId");
  const queryClient = useQueryClient();

  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch conversations local
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      console.log("Fetching conversations list...");
      const response = await conversationRepository.getConversations();
      if (response.success && response.data) {
        console.log("Conversations loaded:", response.data);
        return response.data;
      } else {
        throw new Error("Failed to load conversations");
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Set selected user based on URL param or first conversation
  useEffect(() => {
    if (userIdParam) {
      // Coming from job detail or external link with userId
      setSelectedUserId(userIdParam);
    } else if (conversations.length > 0 && !selectedUserId) {
      // Default to first conversation
      setSelectedUserId(String(conversations[0].otherUserId));
    }
  }, [userIdParam, conversations, selectedUserId]);

  // Get selected conversation data
  const selectedConversation = useMemo(() => {
    if (!selectedUserId) return null;
    return conversations.find((c) => String(c.otherUserId) === selectedUserId);
  }, [selectedUserId, conversations]);

  const handleSelectConversation = (userId) => {
    setSelectedUserId(userId);
    // Update URL without navigation
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/messages?userId=${userId}`);
    }
  };

  // Error state
  if (conversationsError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Failed to load conversations. Please try again.
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:brightness-95 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Left: chat list */}
      <aside className="hidden md:flex md:w-[300px] lg:w-[350px] overflow-hidden">
        <div className="h-full w-full">
          <ChatList
            conversations={conversations}
            selectedUserId={selectedUserId}
            onSelectConversation={handleSelectConversation}
            isLoading={conversationsLoading}
          />
        </div>
      </aside>

      {/* Right: chat thread */}
      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full">
          {selectedUserId && selectedConversation ? (
            <ChatThread
              userId={selectedUserId}
              name={selectedConversation.otherUsername}
              avatar={selectedConversation.profilePicture}
            />
          ) : conversationsLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-600">Loading conversations...</p>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-600">
                Select a conversation to start messaging
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
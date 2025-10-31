"use client";

import React, { Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationRepository } from "@/repositories/conversationRepository";
import ChatList from "./ChatList";
import { Loader2 } from "lucide-react";

function MessagesContent() {
  const queryClient = useQueryClient();

  // Fetch conversations
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
    staleTime: 1000 * 30 * 1, // 2 minutes
    refetchOnWindowFocus: true,
    retry: 3,
  });

  // Error state
  if (conversationsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="mb-2 text-base font-semibold text-slate-900">
            Failed to load conversations
          </p>
          <p className="mb-4 text-sm text-slate-600">
            Please check your connection and try again
          </p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["conversations"] })}
            className="rounded-full bg-[#1B74E4] px-6 py-2.5 text-sm font-medium text-white transition-colors active:bg-[#1557b0]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ChatList
      conversations={conversations}
      isLoading={conversationsLoading}
    />
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-3 animate-spin text-[#1B74E4]" />
            <p className="text-sm text-slate-600">Loading messages...</p>
          </div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

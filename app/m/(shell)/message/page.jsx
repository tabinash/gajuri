"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { conversationRepository } from "@/repositories/conversationRepository";
import { ThumbsUp, Send, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useCurrentUser } from "@/hooks";

function Avatar({ src, name = "", size = "h-10 w-10" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (imgError || !src) {
    return (
      <div className={`grid ${size} shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700`}>
        {initials || "U"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${size} shrink-0 rounded-full object-cover`}
      onError={() => setImgError(true)}
    />
  );
}

function ChatThreadContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [value, setValue] = useState("");
  const [pendingKind, setPendingKind] = useState(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  const { userId: myId, username: myUsername, avatar: myAvatar } = useCurrentUser();

  // Fetch messages
  const {
    data: messages = [],
    isLoading: messagesLoading,
  } = useQuery({
    queryKey: ["conversation", userId],
    queryFn: async () => {
      const response = await conversationRepository.getConversationById(Number(userId));
      if (response?.success && response?.data) {
        return [...response.data].sort((a, b) => a.id - b.id);
      }
      return [];
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30,
  });

  // Get other user info
  const other = (() => {
    const first = messages[0];
    if (!first) return { username: "User", avatar: undefined };
    const amISender = first.senderId === myId;
    return amISender
      ? { username: first.receiverUsername, avatar: first.receiverProfilePicture }
      : { username: first.senderUsername, avatar: first.senderProfilePicture };
  })();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      const response = await conversationRepository.sendMessage(messageData);
      if (!response?.success) throw new Error(response?.message || "Failed to send");
      return response;
    },
    onMutate: async (messageData) => {
      setPendingKind(messageData.content === "👍" ? "like" : "text");
      await queryClient.cancelQueries({ queryKey: ["conversation", userId] });
      const previous = queryClient.getQueryData(["conversation", userId]) || [];
      const optimistic = {
        id: `temp-${Date.now()}`,
        senderId: myId,
        senderProfilePicture: myAvatar,
        senderUsername: myUsername,
        content: messageData.content,
        pending: true,
      };
      queryClient.setQueryData(["conversation", userId], [...previous, optimistic]);
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(["conversation", userId], ctx.previous);
    },
    onSuccess: () => {
      setValue("");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation", userId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setPendingKind(null);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, sendMessageMutation.isPending]);

  const onSend = () => {
    const t = value.trim();
    if (!t || !userId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({
      receiverId: Number(userId),
      content: t,
    });
  };

  const onLike = () => {
    if (!userId || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate({
      receiverId: Number(userId),
      content: "👍",
    });
  };

  const trimmed = value.trim();

  if (!userId) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-sm text-slate-600">No conversation selected</p>
      </div>
    );
  }

  if (messagesLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 size={40} className="mx-auto mb-3 animate-spin" style={{ color: "#1B74E4" }} />
          <p className="text-sm text-slate-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      {/* Header - Mobile optimized */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-700 active:bg-slate-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <Avatar src={other.avatar} name={other.username} size="h-10 w-10" />

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-slate-900">
            {other.username}
          </h1>
          <p className="text-xs text-slate-500">Active recently</p>
        </div>
      </div>

      {/* Messages - Optimized scroll area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-base text-slate-900 font-medium">No messages yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Start the conversation with {other.username}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((m, idx) => {
              const isMe = myId != null && m.senderId === myId;
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== m.senderId);
              const isPending = Boolean(m.pending);

              return (
                <div
                  key={m.id}
                  className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="self-end">
                      {showAvatar ? (
                        <Avatar src={m.senderProfilePicture || other.avatar} name={m.senderUsername} size="h-8 w-8" />
                      ) : (
                        <div className="h-8 w-8" />
                      )}
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                      isMe ? "text-white" : "text-slate-900"
                    } ${isPending ? "opacity-70" : ""}`}
                    style={{
                      backgroundColor: isMe ? "#1B74E4" : "#EFF2F5",
                      borderTopLeftRadius: isMe ? 16 : 4,
                      borderTopRightRadius: isMe ? 4 : 16,
                    }}
                  >
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {m.content}
                    </p>
                    {isMe && isPending && (
                      <div className="mt-1 flex justify-end">
                        <Loader2 size={14} className="animate-spin opacity-80" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer - Mobile keyboard friendly */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-3 safe-area-inset-bottom">
        <div className="flex items-end gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message..."
              disabled={sendMessageMutation.isPending}
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500 disabled:opacity-50"
            />
          </div>

          {/* Send/Like button */}
          {trimmed ? (
            <button
              onClick={onSend}
              disabled={sendMessageMutation.isPending}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-sm disabled:opacity-60"
              style={{ backgroundColor: "#1B74E4" }}
              aria-label="Send message"
            >
              {pendingKind === "text" && sendMessageMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          ) : (
            <button
              onClick={onLike}
              disabled={sendMessageMutation.isPending}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 active:bg-slate-200 disabled:opacity-60"
              aria-label="Send like"
            >
              {pendingKind === "like" && sendMessageMutation.isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ThumbsUp size={20} />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatThread() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-white">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-3 animate-spin" style={{ color: "#1B74E4" }} />
            <p className="text-sm text-slate-600">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatThreadContent />
    </Suspense>
  );
}

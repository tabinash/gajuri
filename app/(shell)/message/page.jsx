"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { conversationRepository } from "@/repositories/conversationRepository";
import { ThumbsUp, Send, Loader2 } from "lucide-react";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks";

function Avatar({ src, name = "", size = "h-9 w-9" }) {
  const [imgError, setImgError] = useState(false);

  const initials = (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (imgError || !src) {
    return (
      <div className={`grid ${size} shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 shadow-sm`}>
        {initials || "U"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-full object-cover shadow-sm`}
      onError={() => setImgError(true)}
    />
  );
}

function ChatThreadContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId"); // conversation partner id

  const [value, setValue] = useState("");
  const [pendingKind, setPendingKind] = useState(null); // "text" | "like" | null
  const endRef = useRef(null);

  const { user: userData, userId: myId, username: myUsername, avatar: myAvatar } = useCurrentUser();

  // Fetch messages (independent)
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

  // Guess other user info from messages (fallbacks if empty)
  const other = (() => {
    const first = messages[0];
    if (!first) return { username: "Conversation", avatar: undefined };
    const amISender = first.receiverId === myId;
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

  const purple = "#7f3dff";
  const gray = "#EFF2F5";
  const trimmed = value.trim();

  if (!userId) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-[#E4E6EB] bg-white">
        <p className="text-sm text-slate-600">Select a chat to start messaging.</p>
      </div>
    );
  }

  if (messagesLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <p className="text-sm text-slate-600">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[95vh] flex-col bg-transparent p-2 -ml-2">
      {/* Card container */}
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E6EB] bg-white shadow-sm">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E6EB] bg-white/95 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-700 hover:text-slate-900">
              <BiLeftArrowAlt size={20} />
            </button>
            <Avatar src={other.avatar} name={other.username} />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-slate-900">
                {other.username}
              </div>
            </div>
          </div>
        </div>

        {/* Thread body */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-3">
          <div>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-500">
                  No messages yet. Start the conversation!
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isMe = myId != null && m.senderId === myId;
                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== m.senderId);
                const isPending = Boolean(m.pending);

                return (
                  <div
                    key={m.id}
                    className={[
                      "mt-3 flex items-end gap-2",
                      isMe ? "justify-end" : "justify-start",
                    ].join(" ")}
                  >
                    {!isMe && (
                      <div className="self-end">
                        {showAvatar ? (
                          <Avatar src={ other.avatar} name={m.senderUsername} size="h-7 w-7" />
                        ) : (
                          <span className="inline-block h-7 w-7" />
                        )}
                      </div>
                    )}

                    <div
                      className={[
                        "max-w-[78%] rounded-2xl px-4 py-2 text-[13px] leading-relaxed shadow-sm",
                        isMe ? "text-white" : "text-slate-900",
                        isPending ? "opacity-70" : "",
                      ].join(" ")}
                      style={{
                        backgroundColor: isMe ? purple : gray,
                        borderTopLeftRadius: isMe ? 16 : 6,
                        borderTopRightRadius: isMe ? 6 : 16,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      <div>{m.content}</div>
                      {isMe && isPending && (
                        <div className="mt-1 flex justify-end">
                          <Loader2 size={14} className="animate-spin opacity-80" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-[#E4E6EB] bg-white px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-full border border-[#E4E6EB] bg-white px-3 shadow-sm ring-0 focus-within:ring-1 focus-within:ring-[#E4E6EB]">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Aa"
                disabled={sendMessageMutation.isPending}
                className="h-10 w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
            </div>

            {trimmed ? (
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-[#1B74E4] text-white shadow-sm hover:brightness-95 disabled:opacity-60"
                onClick={onSend}
                disabled={sendMessageMutation.isPending}
                title="Send"
                aria-label="Send message"
              >
                {pendingKind === "text" && sendMessageMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            ) : (
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-[#1B74E4] text-white shadow-sm hover:brightness-95 disabled:opacity-60"
                onClick={onLike}
                disabled={sendMessageMutation.isPending}
                title="Like"
                aria-label="Send like"
              >
                {pendingKind === "like" && sendMessageMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ThumbsUp size={18} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatThread() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-[95vh] flex-col bg-transparent p-2 -ml-2">
          <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-[#E4E6EB] bg-white shadow-sm">
            <Loader2 size={32} className="animate-spin text-slate-400" />
            <p className="mt-3 text-sm text-slate-600">Loading chat...</p>
          </div>
        </div>
      }
    >
      <ChatThreadContent />
    </Suspense>
  );
}
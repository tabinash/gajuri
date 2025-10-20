"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Mic,
  Image as ImageIcon,
  Smile,
  ThumbsUp,
} from "lucide-react";

type Msg = {
  id: string;
  who: "me" | "them";
  text?: string;
  divider?: string;
  at?: string;
  showAvatar?: boolean;
};

export default function ChatThread({
  name,
  avatar,
}: {
  name: string;
  avatar: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m1", who: "them", text: "chhath paxi janxu hola college tira", showAvatar: true },
    { id: "d1", who: "them", divider: "Fri 4:54PM" },
    {
      id: "m2",
      who: "me",
      text:
        "sir, last time you told that to see actual mark is possible. and you also told my AI mark was arround 37",
    },
    { id: "m3", who: "me", text: "is it possible for this time" },
    {
      id: "m4",
      who: "them",
      text:
        "That marks display was only for one semester. Now, the college does not show marks. it is not possible for this time hai",
      showAvatar: true,
    },
    { id: "m5", who: "me", text: "i am actually depressed. why the marks are not coming in expected way" },
    { id: "m6", who: "me", text: "cryto ma kasto aayecha marks" },
    { id: "m7", who: "me", text: "i am in chitwant,not seen the markseet yet" },
    { id: "m8", who: "them", text: "you got marksheet", showAvatar: true },
    { id: "m9", who: "them", text: "i dont know abinash  i dont have seen marks" },
    { id: "m10", who: "them", text: "ok  i will send your marksheet when college open", showAvatar: true },
    { id: "m11", who: "me", text: "ok sir", at: "Sent 2d ago" },
  ]);

  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs.length]);

  const onSend = () => {
    const t = value.trim();
    if (!t) return;
    setMsgs((m) => [...m, { id: String(Date.now()), who: "me", text: t }]);
    setValue("");
  };

  const purple = "#7f3dff";
  const gray = "#EFF2F5";

  return (
    <div className="flex h-full flex-col bg-transparent p-2 -ml-2">
      {/* Card container */}
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E4E6EB] bg-white shadow-sm">
        {/* Header (card top) */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E6EB] bg-white/95 px-4 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2">
            <img src={avatar} alt={name} className="h-9 w-9 rounded-full object-cover shadow-sm" />
            <div className="min-w-0">
              <div className="truncate text-[15px] font-semibold text-slate-900">{name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[color:#7f3dff]">
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50">
              <Phone size={18} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50">
              <Video size={18} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-50">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Thread body (card content) */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-slate-50 p-3">
          <div className="">
            {msgs.map((m) => {
              if (m.divider) {
                return (
                  <div key={m.id} className="my-3 flex justify-center">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 shadow-sm">
                      {m.divider}
                    </span>
                  </div>
                );
              }

              const isMe = m.who === "me";
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
                      {m.showAvatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover shadow-sm"
                        />
                      ) : (
                        <span className="inline-block h-7 w-7" />
                      )}
                    </div>
                  )}

                  <div
                    className={[
                      "max-w-[78%] rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm",
                      isMe ? "text-white" : "text-slate-900",
                    ].join(" ")}
                    style={{
                      backgroundColor: isMe ? purple : gray,
                      borderTopLeftRadius: isMe ? 16 : 6,
                      borderTopRightRadius: isMe ? 6 : 16,
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {/* Sent note */}
            <div className="mt-2 text-right text-xs text-slate-500">
              {msgs.findLast((m) => m.at)?.at}
            </div>

            <div ref={endRef} />
          </div>
        </div>

        {/* Composer (card bottom) */}
        <div className="border-t border-[#E4E6EB] bg-white px-3 py-2">
          <div className=" flex  items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full text-[#1B74E4] hover:bg-slate-50">
              <Mic size={18} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full text-[#1B74E4] hover:bg-slate-50">
              <ImageIcon size={18} />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-full text-[#1B74E4] hover:bg-slate-50">
              GIF
            </button>

            <div className="flex flex-1 items-center rounded-full border border-[#E4E6EB] bg-white px-3 shadow-sm">
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
                className="h-10 w-full bg-transparent text-[15px] outline-none placeholder:text-slate-400"
              />
            </div>

            <button className="grid h-9 w-9 place-items-center rounded-full text-[#1B74E4] hover:bg-slate-50">
              <Smile size={18} />
            </button>
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-[#1B74E4] text-white shadow-sm"
              onClick={() => setMsgs((m) => [...m, { id: String(Date.now()), who: "me", text: "👍" }])}
              title="Like"
            >
              <ThumbsUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
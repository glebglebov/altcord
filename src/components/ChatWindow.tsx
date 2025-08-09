import React, { useEffect, useRef } from "react";
import { useMessages } from "../store/messages";
import { useChat } from "../hooks/useChat";
import { ChatMessage } from "./ChatMessage";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface Props {
  userId: string;
}

export default function ChatWindow({ userId }: Props) {
  const { list: messages } = useMessages();
  const { input, setInput, sendMessage, showEmoji, setShowEmoji } = useChat(userId);

  const endRef = useRef<HTMLDivElement>(null);
  const emojiBtnRef = useRef<HTMLButtonElement>(null);

  // автоскролл
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // закрыть по Esc
  useEffect(() => {
    if (!showEmoji) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowEmoji(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showEmoji, setShowEmoji]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 p-4 overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((m) => (
          <ChatMessage key={m.id} user={m.user} text={m.text} date={m.date} />
        ))}
        <div ref={endRef} />
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 rounded bg-zinc-700 text-white outline-none"
            placeholder="Введите сообщение…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            ref={emojiBtnRef}
            aria-label="Emoji"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
            onClick={(e) => {
              e.stopPropagation(); // чтобы onClickOutside не сработал мгновенно
              setShowEmoji((v) => !v);
            }}
          >
            😊
          </button>

          {showEmoji && (
            <div className="absolute bottom-12 right-0 z-50 shadow-xl">
              <Picker
                data={data}
                theme="dark"
                onEmojiSelect={(e: any) => setInput((prev) => prev + (e?.native ?? ""))}
                onClickOutside={() => setShowEmoji(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

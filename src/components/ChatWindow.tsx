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

  // автоскролл в конец при появлении новых сообщений
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 p-4 overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto pr-2">
        {messages.map((m) => (
          <ChatMessage
            key={m.id}
            user={m.user}
            text={m.text}
            timestamp={m.timestamp}
          />
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
            aria-label="Emoji"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xl"
            onClick={() => setShowEmoji((v) => !v)}
          >
            😊
          </button>
        </div>

        {showEmoji && (
          <div className="mt-2">
            <Picker
              data={data}
              theme="dark"
              onEmojiSelect={(e: any) => setInput((prev) => prev + (e?.native ?? ""))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

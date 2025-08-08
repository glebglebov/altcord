import React, { useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { UserModel, ChatMessageModel } from "../types";
import { ChatMessage } from "./ChatMessage";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface Props {
  currentUser: UserModel;
  messages: ChatMessageModel[];
}

export default function ChatWindow({ currentUser, messages }: Props) {
  const {
    input,
    setInput,
    sendMessage,
    showEmoji,
    setShowEmoji
  } = useChat(currentUser);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-zinc-900 p-4 overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            user={msg.user}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4">
        <div className="relative">
          <input
            type="text"
            className="w-full p-2 rounded bg-zinc-700 text-white"
            placeholder="Введите сообщение..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="absolute right-2 top-2 text-xl"
            onClick={() => setShowEmoji(!showEmoji)}
          >
            😊
          </button>
        </div>

        {showEmoji && (
          <div className="mt-2">
            <Picker
              data={data}
              onEmojiSelect={(e: any) => setInput((prev) => prev + e.native)}
              theme="dark"
            />
          </div>
        )}
      </div>
    </div>
  );
}

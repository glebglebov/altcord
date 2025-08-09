import { useState } from "react";
import { UserModel } from "../types";
import { BASE_URL } from '../config';

export function useChat(userId: string) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    try {
      const response = await fetch(`${BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: userId,
          text: input
        })
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке сообщения");
      }

      setInput("");
    } catch (err) {
      console.error("Ошибка:", err);
    }
  }

  return {
    input,
    setInput,
    sendMessage,
    showEmoji,
    setShowEmoji
  };
}

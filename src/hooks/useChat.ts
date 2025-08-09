import { useRef, useState } from "react";
import { BASE_URL } from '../config';

export function useChat(userId: string, opts?: { sendTyping?: () => void; typingThrottleMs?: number }) {
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const lastTypingRef = useRef(0);

  const throttle = opts?.typingThrottleMs ?? 1500;

  function onChange(next: string) {
    setInput(next);
    const now = Date.now();
    if (opts?.sendTyping && now - lastTypingRef.current > throttle) {
      lastTypingRef.current = now;
      opts.sendTyping();
    }
  }

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

  return { input, setInput: onChange, sendMessage, showEmoji, setShowEmoji };
}

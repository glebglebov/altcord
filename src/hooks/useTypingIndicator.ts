import { useEffect, useMemo, useRef, useState } from "react";

type TypingMap = Record<string, number>; // userId -> expiresAt (ms)

export function useTypingIndicator(selfUserId: string, ttlMs = 3000) {
  const [map, setMap] = useState<TypingMap>({});
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const onTyping = (e: Event) => {
      const { userId, at } = (e as CustomEvent).detail as { userId: string; at: number };
      if (!userId || userId === selfUserId) return; // себя не показываем
      setMap((prev) => ({ ...prev, [userId]: at + ttlMs }));
    };

    window.addEventListener("ac:typing", onTyping as EventListener);

    // периодически чистим протухшие записи
    timerRef.current = window.setInterval(() => {
      const now = Date.now();
      setMap((prev) => {
        let changed = false;
        const next: TypingMap = {};
        for (const [id, exp] of Object.entries(prev)) {
          if (exp > now) next[id] = exp; else changed = true;
        }
        return changed ? next : prev;
      });
    }, 500);

    return () => {
      window.removeEventListener("ac:typing", onTyping as EventListener);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selfUserId, ttlMs]);

  const ids = useMemo(() => Object.keys(map), [map]);

  return {
    typingUserIds: ids,
    hasTyping: ids.length > 0,
    label: ids.length === 0
      ? ""
      : ids.length === 1
      ? "печатает…"
      : "несколько пользователей печатают…",
  };
}

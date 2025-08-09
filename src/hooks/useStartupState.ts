import { useEffect, useState } from "react";
import { StartupStateModel } from "../types";
import { BASE_URL } from "../config";
import { useUsers } from "../store/users";
import { useMessages } from "../store/messages";
import { joinMessages } from "../utils/joinMessage";

export function useStartupState() {
  const [state, setState] = useState<StartupStateModel | null>(null);
  const [loading, setLoading] = useState(true);

  const { upsertMany: upsertUsers } = useUsers();
  const { upsertMany: upsertMessages } = useMessages();

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/state`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StartupStateModel = await res.json();

        upsertUsers(data.users);

        const usersById = Object.fromEntries(data.users.map(u => [u.id, u]));
        const joined = joinMessages(data.messages, id => usersById[id]);

        upsertMessages(joined);

        setState(data);
      } catch (e) {
        console.error("startup state error:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [upsertUsers, upsertMessages]);

  return { state, loading };
}

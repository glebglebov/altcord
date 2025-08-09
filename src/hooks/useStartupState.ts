import { useEffect, useState } from "react";
import { StartupStateModel } from "../types";
import { BASE_URL } from "../config";
import { useUsers } from "../store/users";
import { useMessages } from "../store/messages";
import { joinMessages } from "../utils/joinMessage";

export function useStartupState() {
  const [state, setState] = useState<StartupStateModel | null>(null);
  const [loading, setLoading] = useState(true);

  const { upsertMany: upsertUsers, state: usersState } = useUsers();
  const { upsertMany: upsertMessages } = useMessages();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/state`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        const data: StartupStateModel = await res.json();

        upsertUsers(data.users);

        const joined = joinMessages(data.messages, (id) => usersState[id]);
        upsertMessages(joined);

        setState(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [upsertUsers, upsertMessages, usersState]);

  return { state, loading };
}

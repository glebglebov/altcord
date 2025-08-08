import { useState, useEffect } from "react";
import { StartupStateModel } from "../types";
import { BASE_URL } from '../config';

export function useStartupState() {
  const [state, setState] = useState<StartupStateModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchState() {
      try {
        const res = await fetch(`${BASE_URL}/api/state`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: StartupStateModel = await res.json();
        setState(data);
      } catch (err) {
        console.error("Ошибка при получении стартового состояния:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchState();
  }, []);

  return { state, loading };
}

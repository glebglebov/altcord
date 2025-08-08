import { useState } from "react";
import { UserModel } from "../types";
import { BASE_URL } from "../config";

export function useLogin(onSuccess: (user: UserModel) => void) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      if (!res.ok) throw new Error("Ошибка авторизации");

      const user: UserModel = await res.json();
      onSuccess(user);
    } catch (err) {
      alert("Не удалось войти");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { username, setUsername, login, loading };
}

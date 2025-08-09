import React from "react";
import { useLogin } from "../hooks/useLogin";

interface Props {
  onLogin: (userId: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const { username, setUsername, login, loading } = useLogin(onLogin);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-900 text-white">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Введите имя пользователя</h1>
        <input
          type="text"
          className="p-2 rounded bg-zinc-800 text-white w-64"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          disabled={loading}
        />
        <button
          onClick={login}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </div>
    </div>
  );
}

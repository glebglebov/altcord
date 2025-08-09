import React from "react";
import { useUsers } from "../store/users";

export default function RightSidebar() {
  const { list: users } = useUsers();

  const online = users.filter(u => u.isOnline);
  const offline = users.filter(u => !u.isOnline);

  return (
    <div className="w-72 bg-zinc-800 flex flex-col p-4 border-l border-zinc-700 overflow-y-auto">
      <div className="mb-4">
        <div className="text-sm text-zinc-400 mb-2">🟢 Онлайн ({online.length})</div>
        <ul className="space-y-1 text-sm">
          {online.map(u => (
            <li key={u.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white">{u.username}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-sm text-zinc-400 mb-2 mt-4">⚪ Оффлайн ({offline.length})</div>
        <ul className="space-y-1 text-sm">
          {offline.map(u => (
            <li key={u.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-zinc-400">{u.username}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

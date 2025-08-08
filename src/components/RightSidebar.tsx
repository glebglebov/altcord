import React from "react";
import { RightSidebarUserModel } from "../types";

interface Props {
  users: RightSidebarUserModel[];
}

export default function RightSidebar({ users }: Props) {
  const online = users.filter(u => u.online);
  const offline = users.filter(u => !u.online);

  return (
    <div className="w-1/4 bg-zinc-800 flex flex-col p-4 border-l border-zinc-700 overflow-y-auto">
      <div className="mb-4">
        <div className="text-sm text-zinc-400 mb-1">🟢 Онлайн ({online.length})</div>
        <ul className="space-y-1 text-sm">
          {online.map(({ user }) => (
            <li key={user.username} className="text-green-400">{user.username}</li>
          ))}
        </ul>
      </div>

      <div>
        <div className="text-sm text-zinc-400 mb-1 mt-4">⚪ Оффлайн ({offline.length})</div>
        <ul className="space-y-1 text-sm">
          {offline.map(({ user }) => (
            <li key={user.username} className="text-zinc-500">{user.username}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

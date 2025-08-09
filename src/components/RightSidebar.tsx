import React from "react";
import { useUsers } from "../store/users";
import { UserModel } from "../types";

export default function RightSidebar() {
  const { list: users } = useUsers();

  const online = users.filter(u => u.isOnline);
  const offline = users.filter(u => !u.isOnline);

  return (
    <aside className="w-72 bg-zinc-800 flex flex-col p-4 border-l border-zinc-700 overflow-y-auto">
      <Section title={`В сети – ${online.length}`}>
        {online.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </Section>

      <Section title={`Не в сети – ${offline.length}`} className="mt-4">
        {offline.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </Section>
    </aside>
  );
}

function Section({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-sm text-zinc-400 mb-2">{title}</div>
      <ul className="space-y-1 text-sm">{children}</ul>
    </div>
  );
}

function UserRow({ user }: { user: UserModel }) {
  return (
    <li className="flex items-center gap-3 px-2 py-1 rounded hover:bg-zinc-700/40">
      <AvatarWithStatus
        avatarUrl={user.avatarUrl}
        fallbackColor={user.color}
        online={user.isOnline}
        size={36}
      />
      <div className="min-w-0">
        <div
          className={`truncate ${user.isOnline ? "text-white" : "text-zinc-400"}`}
          title={user.username}
        >
          {user.username}
        </div>
        {/* при желании можно добавить подпись/статус второй строкой */}
      </div>
    </li>
  );
}

function AvatarWithStatus({
  avatarUrl,
  fallbackColor = "#4b5563",
  online,
  size = 36,
}: {
  avatarUrl?: string;
  fallbackColor?: string;
  online: boolean;
  size?: number;
}) {
  const dotClass = online ? "bg-green-500" : "bg-zinc-500";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full overflow-hidden w-full h-full"
        style={{ backgroundColor: fallbackColor }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : null}
      </div>

      <span
        className={`absolute bottom-0 right-0 ${dotClass} rounded-full ring-2 ring-zinc-800`}
        style={{
          width: size * 0.28,
          height: size * 0.28,
        }}
      />
    </div>
  );
}

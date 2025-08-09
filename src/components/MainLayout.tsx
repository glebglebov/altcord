import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import RightSidebar from "./RightSidebar";

import { useVoiceChat } from "../hooks/useVoiceChat";
import { useStartupState } from "../hooks/useStartupState";
import { useGlobalHub } from "../hooks/useGlobalHub";

import { UserModel } from "../types";

interface Props {
  user: UserModel;
}

export default function MainLayout({ user }: Props) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<UserModel[]>([]);

  useVoiceChat(voiceEnabled, user.username);

  // Стартовое состояние заселяет сторы (users/messages) + возвращает voiceChannelUsers
  const { state: startupState, loading } = useStartupState();

  // Хаб: регистрируемся, слушаем userUpdated/messageEvent, делаем heartbeat
  useGlobalHub({ currentUserId: user.id });

  // Применяем voice список со старта
  useEffect(() => {
    if (startupState) {
      setVoiceUsers(startupState.voiceChannelUsers);
    }
  }, [startupState]);

  // Разрешение на нотификации
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (loading && !startupState) {
    return <div className="text-white p-4">Загрузка…</div>;
  }

  return (
    <div className="flex h-screen bg-zinc-900 text-white">
      <Sidebar
        voiceUsers={voiceUsers}
        joined={voiceEnabled}
        onJoinVoice={() => setVoiceEnabled(true)}
        onLeaveVoice={() => setVoiceEnabled(false)}
      />

      <div className="flex-1 flex flex-col">
        <ChatWindow currentUser={user} />
      </div>

      <RightSidebar />
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import RightSidebar from "./RightSidebar";

import { useVoiceChat } from "../hooks/useVoiceChat";
import { useStartupState } from "../hooks/useStartupState";
import { useGlobalHub } from "../hooks/useGlobalHub";

import {
  ChatMessageModel,
  RightSidebarUserModel,
  UserModel,
} from "../types";

interface Props {
  user: UserModel; // текущий авторизованный пользователь (с id)
}

export default function MainLayout({ user }: Props) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<UserModel[]>([]);

  const { state: startupState, loading } = useStartupState();

  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [users, setUsers] = useState<RightSidebarUserModel[]>([]);

  useVoiceChat(voiceEnabled, user.username);

  // Подключение к общему SignalR-хабу и получение обновлений приложения
  useGlobalHub({
    currentUserId: user.id,

    onNewMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
    },

    onUserOnline: (u) => {
      // Заменяем (или добавляем) запись о пользователе по его id
      setUsers((prev) => {
        const filtered = prev.filter((x) => x.user.id !== u.user.id);
        return [...filtered, u];
      });
    },

    onUserOffline: (userId) => {
      // Помечаем оффлайн по id
      setUsers((prev) =>
        prev.map((x) => (x.user.id === userId ? { ...x, online: false } : x))
      );
    },

    onVoiceJoin: (u) => {
      setVoiceUsers((prev) => {
        if (prev.some((x) => x.id === u.id)) return prev;
        return [...prev, u];
      });
    },

    onVoiceLeave: (userId) => {
      setVoiceUsers((prev) => prev.filter((x) => x.id !== userId));
    },
  });

  // Инициализация состояния после загрузки с сервера
  useEffect(() => {
    if (startupState) {
      setMessages(startupState.messages);
      setUsers(startupState.users);
      setVoiceUsers(startupState.voiceChannelUsers);
    }
  }, [startupState]);

  // Запрашиваем разрешение на системные уведомления
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (loading && !startupState) {
    return <div className="text-white p-4">Загрузка...</div>;
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
        <ChatWindow
          currentUser={user}
          messages={messages}
        />
      </div>

      <RightSidebar users={users} />
    </div>
  );
}

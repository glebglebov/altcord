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
  username: string;
}

export default function MainLayout({ username }: Props) {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<UserModel[]>([]);

  const { state: startupState, loading } = useStartupState();

  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [users, setUsers] = useState<RightSidebarUserModel[]>([]);

  const currentUser = users.find(u => u.user.username === username)?.user;

  useVoiceChat(voiceEnabled, username);

  // Подключение к SignalR-хабу и получение обновлений
  useGlobalHub({
    currentUsername: username,

    onNewMessage: (msg) => {
      setMessages(prev => [...prev, msg]);
    },

    onUserOnline: (user) => {
      setUsers(prev => {
        const filtered = prev.filter(u => u.user.username !== user.user.username);
        return [...filtered, user];
      });
    },

    onUserOffline: (username) => {
      setUsers(prev =>
        prev.map(u =>
          u.user.username === username ? { ...u, online: false } : u
        )
      );
    },

    onVoiceJoin: (user) => {
      setVoiceUsers(prev => [...prev, user]);
    },

    onVoiceLeave: (username) => {
      setVoiceUsers(prev => prev.filter(u => u.username !== username));
    }
  });

  // Инициализация состояния после загрузки с сервера
  useEffect(() => {
    if (startupState) {
      setMessages(startupState.messages);
      setUsers(startupState.users);
      setVoiceUsers(startupState.voiceChannelUsers);
    }
  }, [startupState]);

  // Запрашиваем разрешение на нотификации
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  if (loading || !startupState || !currentUser) {
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
        <ChatWindow currentUser={currentUser} messages={messages} />
      </div>

      <RightSidebar users={users} />
    </div>
  );
}

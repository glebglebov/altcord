import { useEffect } from "react";
import { ChatMessageModel, RightSidebarUserModel, UserModel } from "../types";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BASE_URL } from '../config';

interface GlobalHubOptions {
  currentUsername: string;

  onNewMessage?: (msg: ChatMessageModel) => void;
  onUserOnline?: (user: RightSidebarUserModel) => void;
  onUserOffline?: (username: string) => void;
  onVoiceJoin?: (user: UserModel) => void;
  onVoiceLeave?: (username: string) => void;
}

export function useGlobalHub(options: GlobalHubOptions) {
  useEffect(() => {
    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hub/state`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    connection.on("newMessage", (msg: ChatMessageModel) => {
      if (msg.user.username !== options.currentUsername) {
        new Audio("notification.wav").play().catch(() => {});

        if (Notification.permission === "granted") {
          new Notification(`${msg.user.username}: ${msg.text}`);
        }
      }

      options.onNewMessage?.(msg);
    });

    connection.on("userOnline", (user: RightSidebarUserModel) => {
      options.onUserOnline?.(user);
    });

    connection.on("userOffline", (username: string) => {
      options.onUserOffline?.(username);
    });

    connection.on("voiceUserJoined", (user: UserModel) => {
      options.onVoiceJoin?.(user);
    });

    connection.on("voiceUserLeft", (username: string) => {
      options.onVoiceLeave?.(username);
    });

    connection.start()
      .then(() => console.log("Connected to /hub/state"))
      .catch(console.error);

    return () => {
      connection.stop();
    };
  }, []);
}

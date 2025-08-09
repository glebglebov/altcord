import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BASE_URL } from "../config";
import { NewMessageSentEvent, ChatMessageRawModel, NewUserJoinedEvent, UserStatusChangedEvent } from "../types";
import { useUsers } from "../store/users";
import { useMessages } from "../store/messages";
import { joinMessage } from "../utils/joinMessage";

export function useGlobalHub({ currentUserId }: { currentUserId: string }) {
  const { state: usersById, upsertOne: upsertUser } = useUsers();
  const { upsertOne: upsertMsg, removeOne: removeMsg } = useMessages();

  const usersRef = useRef(usersById);
  useEffect(() => { usersRef.current = usersById; }, [usersById]);

  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    let disposed = false;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hub/state`, { withCredentials: false })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    const onNewUserJoined = (e: NewUserJoinedEvent) => {
      upsertUser(e.user);
    };

    const onUserStatusChanged = (e: UserStatusChangedEvent) => {
      const user = usersRef.current[e.userId];

      if (!user) return;

      user.isOnline = e.isOnline;
      upsertUser(user);
    };

    const onChatStateChanged = (e: any) => {
      const onNewMessageSentEvent = (ev: NewMessageSentEvent) => {
        const model = joinMessage(ev.message, id => usersRef.current[id]);
        if (!model) return;

        if (model.user.id !== currentUserId) {
          new Audio("notification.wav").play().catch(() => {});
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification(`${model.user.username}: ${model.text}`);
          }
        }

        upsertMsg(model);
      };

      switch (e.type) {
        case "new":
          onNewMessageSentEvent(e);
          break;
      }
    }

    const onTyping = ({ userId }: { userId: string }) => {
      window.dispatchEvent(new CustomEvent("ac:typing", { detail: { userId, at: Date.now() } }));
    };

    connection.on("newUserJoined", onNewUserJoined);
    connection.on("userStatusChanged", onUserStatusChanged);
    connection.on("chatStateChanged", onChatStateChanged);
    connection.on("typing", onTyping);

    let hbId: number | null = null;

    connection
      .start()
      .then(async () => {
        if (disposed) return;
        hbId = window.setInterval(() => {
          connection.invoke("Heartbeat", currentUserId).catch(() => {});
        }, 3000);
      })
      .catch(console.error);

    return () => {
      disposed = true;
      if (hbId) {
        clearInterval(hbId);
        hbId = null;
      }
      try {
        connection.off("newUserJoined", onNewUserJoined);
        connection.off("userStatusChanged", onUserStatusChanged);
        connection.off("chatStateChanged", onChatStateChanged);
        connection.off("typing", onTyping);
      } catch {}
      connection.stop().catch(() => {});
      connectionRef.current = null; 
    };
  }, [currentUserId]);

  const sendTyping = () => {
    const conn = connectionRef.current;
    if (conn) conn.invoke("Typing", currentUserId).catch(() => {});
  };

  return { sendTyping };
}

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

  useEffect(() => {
    let disposed = false;

    const connection: HubConnection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hub/state`, { withCredentials: false })
      .withAutomaticReconnect()
      .build();

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

    connection.on("newUserJoined", onNewUserJoined);
    connection.on("userStatusChanged", onUserStatusChanged);
    connection.on("chatStateChanged", onChatStateChanged);

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
      } catch {}
      connection.stop().catch(() => {});
    };
  }, [currentUserId]);
}

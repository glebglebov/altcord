import { useEffect, useRef } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { BASE_URL } from "../config";
import { ChatMessageEvent, ChatMessageRawModel, UserModel } from "../types";
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

    const onUserUpdated = (user: UserModel) => {
      upsertUser(user);
    };

    const onMessageEvent = (ev: ChatMessageEvent) => {
      if (ev.type === "deleted") {
        removeMsg(ev.id);
        return;
      }

      const payload = ev.payload as ChatMessageRawModel;
      const model = joinMessage(payload, id => usersRef.current[id]);

      if (!model) return;

      if (ev.type === "created" && model.user.id !== currentUserId) {
        new Audio("notification.wav").play().catch(() => {});
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`${model.user.username}: ${model.text}`);
        }
      }

      upsertMsg(model);
    };

    connection.on("userUpdated", onUserUpdated);
    connection.on("messageEvent", onMessageEvent);

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
        connection.off("userUpdated", onUserUpdated);
        connection.off("messageEvent", onMessageEvent);
      } catch {}
      connection.stop().catch(() => {});
    };
  }, [currentUserId]);
}

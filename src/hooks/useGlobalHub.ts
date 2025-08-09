import { useEffect, useRef } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { BASE_URL } from "../config";
import { ChatMessageEvent, ChatMessageRawModel, UserModel } from "../types";
import { useUsers } from "../store/users";
import { useMessages } from "../store/messages";
import { joinMessage } from "../utils/joinMessage";

export function useGlobalHub({ currentUserId }: { currentUserId: string }) {
  const { state: usersById, upsertOne: upsertUser } = useUsers();
  const { upsertOne: upsertMsg, removeOne: removeMsg } = useMessages();

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hub/state`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    connection.on("userUpdated", (user: UserModel) => {
      upsertUser(user);
    });

    connection.on("messageEvent", (ev: ChatMessageEvent) => {
      if (ev.type === "deleted") {
        removeMsg(ev.id);
        return;
      }

      const payload = ev.payload as ChatMessageRawModel;
      const model = joinMessage(payload, (id) => usersById[id]);

      if (!model) {
        return;
      }

      if (ev.type === "created" && model.user.id !== currentUserId) {
        new Audio("notification.wav").play().catch(() => {});
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification(`${model.user.username}: ${model.text}`);
        }
      }

      upsertMsg(model);
    });

    connection.start()
      .then(async () => {
        await connection.invoke("Register", currentUserId);
        const t = setInterval(() => connection.invoke("Heartbeat", currentUserId).catch(() => {}), 15000);
        (window as any).__hubHeartbeat = t;
      })
      .catch(console.error);

    return () => {
      const t = (window as any).__hubHeartbeat;
      if (t) clearInterval(t);
      connection.stop();
    };
  }, [currentUserId, usersById, upsertUser, upsertMsg, removeMsg]);
}

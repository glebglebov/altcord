// src/store/messages.tsx
import React, { createContext, useContext, useMemo, useReducer } from "react";
import { ChatMessageModel } from "../types";

type MsgState = {
  byId: Record<string, ChatMessageModel>;
  order: string[];
};

type Action =
  | { type: "UPSERT_MANY"; messages: ChatMessageModel[] }
  | { type: "UPSERT_ONE"; message: ChatMessageModel }
  | { type: "REMOVE_ONE"; id: string };

function reducer(state: MsgState, action: Action): MsgState {
  switch (action.type) {
    case "UPSERT_MANY": {
      const byId = { ...state.byId };
      const order = new Set(state.order);
      for (const m of action.messages) {
        byId[m.id] = m;
        order.add(m.id);
      }
      const ord = Array.from(order);
      ord.sort((a, b) =>
        new Date(byId[a].timestamp).getTime() - new Date(byId[b].timestamp).getTime()
      );
      return { byId, order: ord };
    }
    case "UPSERT_ONE": {
      const byId = { ...state.byId, [action.message.id]: action.message };
      const order = state.order.includes(action.message.id)
        ? [...state.order]
        : [...state.order, action.message.id];
      order.sort((a, b) =>
        new Date(byId[a].timestamp).getTime() - new Date(byId[b].timestamp).getTime()
      );
      return { byId, order };
    }
    case "REMOVE_ONE": {
      const byId = { ...state.byId };
      delete byId[action.id];
      const order = state.order.filter((x) => x !== action.id);
      return { byId, order };
    }
    default:
      return state;
  }
}

const MessagesContext = createContext<{
  state: MsgState;
  upsertMany: (m: ChatMessageModel[]) => void;
  upsertOne: (m: ChatMessageModel) => void;
  removeOne: (id: string) => void;
  list: ChatMessageModel[];
} | null>(null);

export const MessagesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { byId: {}, order: [] });
  const value = useMemo(() => {
    const list = state.order.map(id => state.byId[id]).filter(Boolean);
    return {
      state,
      upsertMany: (messages: ChatMessageModel[]) => dispatch({ type: "UPSERT_MANY", messages }),
      upsertOne: (message: ChatMessageModel) => dispatch({ type: "UPSERT_ONE", message }),
      removeOne: (id: string) => dispatch({ type: "REMOVE_ONE", id }),
      list
    };
  }, [state]);
  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}

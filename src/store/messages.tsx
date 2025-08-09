import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";
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
      const orderSet = new Set(state.order);
      for (const m of action.messages) {
        byId[m.id] = m;
        orderSet.add(m.id);
      }
      const order = Array.from(orderSet);
      order.sort((a, b) =>
        byId[a].date.getTime() - byId[b].date.getTime()
      );
      return { byId, order };
    }
    case "UPSERT_ONE": {
      const byId = { ...state.byId, [action.message.id]: action.message };
      const order = state.order.includes(action.message.id)
        ? state.order.slice()
        : [...state.order, action.message.id];
      order.sort((a, b) =>
        byId[a].date.getTime() - byId[b].date.getTime()
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

  const upsertMany = useCallback((messages: ChatMessageModel[]) => {
    dispatch({ type: "UPSERT_MANY", messages });
  }, []);

  const upsertOne = useCallback((message: ChatMessageModel) => {
    dispatch({ type: "UPSERT_ONE", message });
  }, []);

  const removeOne = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ONE", id });
  }, []);

  const list = useMemo(
    () => state.order.map((id) => state.byId[id]).filter(Boolean),
    [state.order, state.byId]
  );

  const value = useMemo(
    () => ({ state, upsertMany, upsertOne, removeOne, list }),
    [state, upsertMany, upsertOne, removeOne, list]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export function useMessages() {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error("useMessages must be used within MessagesProvider");
  return ctx;
}

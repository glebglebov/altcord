import React, { createContext, useContext, useMemo, useReducer, useCallback } from "react";
import { UserModel } from "../types";

type UsersState = Record<string, UserModel>;

type Action =
  | { type: "UPSERT_ONE"; user: UserModel }
  | { type: "UPSERT_MANY"; users: UserModel[] };

function reducer(state: UsersState, action: Action): UsersState {
  switch (action.type) {
    case "UPSERT_ONE":
      return { ...state, [action.user.id]: action.user };
    case "UPSERT_MANY": {
      const copy = { ...state };
      for (const u of action.users) copy[u.id] = u;
      return copy;
    }
    default:
      return state;
  }
}

const UsersContext = createContext<{
  state: UsersState;
  upsertOne: (u: UserModel) => void;
  upsertMany: (u: UserModel[]) => void;
  list: UserModel[];
} | null>(null);

export const UsersProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {});

  const upsertOne = useCallback((user: UserModel) => {
    dispatch({ type: "UPSERT_ONE", user });
  }, []);

  const upsertMany = useCallback((users: UserModel[]) => {
    dispatch({ type: "UPSERT_MANY", users });
  }, []);

  const list = useMemo(() => Object.values(state), [state]);

  const value = useMemo(
    () => ({ state, upsertOne, upsertMany, list }),
    [state, upsertOne, upsertMany, list]
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}

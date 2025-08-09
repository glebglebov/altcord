import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import MainLayout from "./components/MainLayout";
import { UsersProvider } from "./store/users";
import { MessagesProvider } from "./store/messages";
import { UserModel } from "./types";

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);

  return (
    <UsersProvider>
      <MessagesProvider>
        {!userId ? <LoginPage onLogin={setUserId} /> : <MainLayout userId={userId} />}
      </MessagesProvider>
    </UsersProvider>
  );
}

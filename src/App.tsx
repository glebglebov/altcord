import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import MainLayout from "./components/MainLayout";
import { UsersProvider } from "./store/users";
import { MessagesProvider } from "./store/messages";
import { UserModel } from "./types";

export default function App() {
  const [user, setUser] = useState<UserModel | null>(null);

  return (
    <UsersProvider>
      <MessagesProvider>
        {!user ? <LoginPage onLogin={setUser} /> : <MainLayout user={user} />}
      </MessagesProvider>
    </UsersProvider>
  );
}

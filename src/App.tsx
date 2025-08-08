import React, { useState } from "react";
import LoginPage from "./components/LoginPage";
import MainLayout from "./components/MainLayout";
import { UserModel } from "./types";

function App() {
  const [user, setUser] = useState<UserModel | null>(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return <MainLayout user={user} />;
}

export default App;

import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';

export default function App() {
  const [username, setUsername] = useState<string>('');

  return (
    <>
      {!username ? (
        <LoginPage onSubmit={setUsername} />
      ) : (
        <MainLayout username={username} />
      )}
    </>
  );
}

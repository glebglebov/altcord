import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import { useVoiceChat } from './hooks/useVoiceChat';
import { useVoiceUserList } from './hooks/useVoiceUserList';

export default function App() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceUsers, setVoiceUsers] = useState<string[]>([]);
  const [username, setUsername] = useState<string>('');
  const [talkingUsers, setTalkingUsers] = useState<Map<string, boolean>>(new Map());

  useVoiceChat(voiceEnabled, username, setTalkingUsers);
  useVoiceUserList(setVoiceUsers);

  return (
    <>
      {!username ? (
        <LoginPage onSubmit={setUsername} />
      ) : (
        <div className="flex h-screen bg-zinc-900 text-white">
          <Sidebar
            joined={voiceEnabled}
            onJoinVoice={() => setVoiceEnabled(true)}
            onLeaveVoice={() => setVoiceEnabled(false)}
            voiceUsers={voiceUsers}
            talkingUsers={talkingUsers}
          />
          <div className="flex-1 flex flex-col">
            <ChatWindow username={username} />
          </div>
        </div>
      )}
    </>
  );
}

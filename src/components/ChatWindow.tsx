import React, { useEffect, useState, useRef } from 'react';
import { ChatMessage } from './ChatMessage';

import { ChatMessageModel, UserModel } from '../types';

import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { BASE_URL } from '../config';
import { deserializeChatMessage } from '../utils';

interface Props {
  username: string;
}

export default function ChatWindow({ username }: Props) {
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [input, setInput] = useState('');
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  const emojiRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hub`, {
        withCredentials: false
      })
      .withAutomaticReconnect()
      .build();

    newConnection.start().then(() => {
      console.log('Connected to SignalR');

      newConnection.on('ReceiveMessage', (messageJson: any) => {
        try {
          const message = deserializeChatMessage(messageJson);
          setMessages(prev => [...prev, message]);

          if (message.user.username !== username) {
            new Audio('notification.wav').play().catch(() => {});

            if (Notification.permission === 'granted') {
              new Notification(`New message from ${message.user.username}`, {
                body: message.text,
                silent: true
              });
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission();
            }
          }
        } catch (err) {
          console.error("Invalid message structure:", err);
        }

        
      });

    }).catch(err => console.error('SignalR error:', err));

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    }

    if (showEmoji) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmoji]);

  function sendMessage() {
    if (connection && input.trim() !== '') {
      connection.invoke('SendMessage', username, input);
      setInput('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function addEmoji(e: any) {
    setInput(prev => prev + e.native);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            user={msg.user}
            text={msg.text}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-zinc-700 p-3">
        <div className="relative flex items-center bg-zinc-800 rounded w-full pr-20">
          {/* Input */}
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-white p-3 pl-5 pr-4 outline-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />

          {/* Container for buttons (positioned absolutely inside input) */}
          <div className="absolute right-2 flex items-center gap-2">
            {/* Emoji Button */}
            <button
              onClick={() => setShowEmoji(prev => !prev)}
              className="text-xl"
            >
              😊
            </button>

            {/* Send Button (Arrow Icon) */}
            <button
              onClick={sendMessage}
              className="text-white text-lg hover:text-indigo-400 transition"
            >
              ➤
            </button>
          </div>

          {/* Emoji Picker (above input) */}
          {showEmoji && (
          <div
            className="absolute bottom-full right-12 mb-2 z-20"
            ref={emojiRef}
          >
            <Picker data={data} onEmojiSelect={addEmoji} theme="dark" />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

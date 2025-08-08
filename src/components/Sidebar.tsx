import React from 'react';
import { UserModel } from "../types";

interface Props {
  joined: boolean;
  onJoinVoice: () => void;
  onLeaveVoice: () => void;
  voiceUsers: UserModel[];
}

export default function Sidebar({ joined, onJoinVoice, onLeaveVoice, voiceUsers }: Props) {
  return (
    <div className="w-1/4 bg-zinc-800 flex flex-col justify-between p-4">
      <div className="flex-1">
        <div className="text-lg font-semibold mb-4"># general</div>
        
        <div className="text-sm text-zinc-400 mb-1">В голосовом канале:</div>
        <ul className="space-y-1 text-sm">
        {voiceUsers.map((u, i) => {
        return (
            <li
              key={i}
              className={`px-2 py-1 rounded border border-transparent bg-zinc-700 text-white'`}
            >
            {u.username}
            </li>
        );
        })}
        </ul>
      </div>

      <button
        className={`transition py-2 px-4 rounded ${
          joined
            ? 'bg-red-600 hover:bg-red-500'
            : 'bg-indigo-600 hover:bg-indigo-500'
        }`}
        onClick={joined ? onLeaveVoice : onJoinVoice}
      >
        {joined ? 'Отключиться' : 'Присоединиться'}
      </button>
    </div>
  );
}
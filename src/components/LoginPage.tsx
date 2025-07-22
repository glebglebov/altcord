import React, { useState } from 'react';

interface Props {
  onSubmit: (username: string) => void;
}

export default function LoginPage({ onSubmit }: Props) {
  const [tempName, setTempName] = useState('');

  function handleSubmit() {
    if (tempName.trim()) {
      onSubmit(tempName.trim());
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-6 rounded shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Enter your name</h2>
        <input
          type="text"
          className="w-full p-2 rounded bg-zinc-700 text-white outline-none"
          placeholder="Username"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 transition rounded py-2"
          onClick={handleSubmit}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

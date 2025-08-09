import { ChatMessageModel } from '../types';

export function deserializeChatMessage(obj: any): ChatMessageModel {
  if (
    typeof obj !== 'object' ||
    typeof obj.text !== 'string' ||
    typeof obj.timestamp !== 'string' ||
    typeof obj.user !== 'object' ||
    typeof obj.user.avatarUrl !== 'string' ||
    typeof obj.user.userName !== 'string'
  ) {
    throw new Error("Invalid message format");
  }

  return {
    user: {
      username: obj.user.userName,
      avatarUrl: obj.user.avatarUrl,
      color: obj.user.color || getColorFromUsername(obj.user.userName)
    },
    text: obj.text,
    timestamp: obj.timestamp
  };
}

function getColorFromUsername(name: string): string {
  const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc', '#fb7185'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
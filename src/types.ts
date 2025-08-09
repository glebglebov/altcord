export interface AuthResult {
  id: string;
}

export interface UserModel {
  id: string;
  username: string;
  avatarUrl: string;
  color: string;
  isOnline: boolean;
}

export interface ChatMessageEvent {
  id: string;
  type: string;
  payload: any | null;
}

export interface ChatMessageRawModel {
  id: string;
  userId: string;
  text: string;
  timestamp: string; 
}

export interface ChatMessageModel {
  id: string;
  user: UserModel;
  text: string;
  timestamp: string; // ISO 8601
}

export interface StartupStateModel {
  users: UserModel[];
  messages: ChatMessageRawModel[];
  voiceChannelUsers: UserModel[];
}
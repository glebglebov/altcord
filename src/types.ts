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
  date: Date;
}

export interface StartupStateModel {
  users: UserModel[];
  messages: ChatMessageRawModel[];
  voiceChannelUsers: UserModel[];
}

// global hub events

export interface UserStatusChangedEvent {
  userId: string;
  isOnline: boolean;
}

export interface NewUserJoinedEvent {
  user: UserModel;
}

export interface NewMessageSentEvent {
  message: ChatMessageRawModel
}
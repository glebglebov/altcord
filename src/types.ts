export interface UserModel {
  id: string;
  username: string;
  avatarUrl: string;
  color: string;
}

export interface RightSidebarUserModel {
  user: UserModel;
  online: boolean;
}

export interface ChatMessageModel {
  user: UserModel;
  text: string;
  timestamp: string; // ISO 8601
}

export interface StartupStateModel {
  users: RightSidebarUserModel[];
  messages: ChatMessageModel[];
  voiceChannelUsers: UserModel[];
}
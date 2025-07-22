export interface UserModel {
  username: string;
  avatarUrl: string;
  color: string;
}

export interface ChatMessageModel {
  user: UserModel;
  text: string;
  timestamp: string; // ISO 8601
}
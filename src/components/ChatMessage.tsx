import { UserModel } from "../types";

interface MessageProps {
  user: UserModel;
  text: string;
  timestamp: string;
}

export const ChatMessage: React.FC<MessageProps> = ({
  user,
  text,
  timestamp
}) => {
  return (
    <div className="flex items-start gap-3 py-2 px-4 hover:bg-zinc-800 transition">
      {/* Кружок-аватар */}
      <div
        className="w-12 h-12 rounded-full flex-shrink-0 bg-cover bg-center bg-zinc-700"
        style={{
            backgroundImage: `url(${user.avatarUrl})`,
            backgroundColor: user.color
        }}
      ></div>

      <div className="flex flex-col text-sm text-white">
        <div className="flex items-center gap-2">
          <span className="font-semibold" style={{ color: user.color }}>
            {user.username}
          </span>
          <span className="text-xs text-zinc-400">{timestamp}</span>
        </div>
        <div className="mt-0.5 text-base text-white whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
};
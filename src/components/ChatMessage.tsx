import { UserModel } from "../types";
import { formatDate } from "../utils/formatDate";

interface MessageProps {
  user: UserModel;
  text: string;
  date: Date;
}

export const ChatMessage: React.FC<MessageProps> = ({
  user,
  text,
  date
}) => {
  return (
    <div className="flex items-start gap-3 py-2 px-4 hover:bg-zinc-800 transition">
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
          <span className="text-xs text-zinc-400">{formatDate(date)}</span>
        </div>
        <div className="mt-0.5 text-base text-white whitespace-pre-wrap">{text}</div>
      </div>
    </div>
  );
};
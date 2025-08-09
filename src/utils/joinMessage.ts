import { ChatMessageModel, ChatMessageRawModel, UserModel } from "../types";

/**
 * Джойнит одно "тонкое" сообщение с пользователем.
 * @param m тонкое сообщение (authorId)
 * @param getUser функция-доступ к пользователю по id
 * @returns ChatMessageView или null, если автора пока нет
 */
export function joinMessage(
  m: ChatMessageRawModel,
  getUser: (id: string) => UserModel | undefined
): ChatMessageModel | null {
  const author = getUser(m.userId);

  if (!author) return null;

  return {
    id: m.id,
    user: author,
    text: m.text,
    timestamp: m.timestamp
  };
}

/**
 * Джойнит массив тонких сообщений.
 * Сообщения без автора отбрасываются (вернёт только готовые).
 */
export function joinMessages(
  messages: ChatMessageRawModel[],
  getUser: (id: string) => UserModel | undefined
): ChatMessageModel[] {
  const out: ChatMessageModel[] = [];
  for (const m of messages) {
    const v = joinMessage(m, getUser);
    if (v) out.push(v);
  }
  return out;
}

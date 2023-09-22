import { Message } from "telegraf/types";
import { AnyContext } from "../context";
import { SessionData } from "./database";

/**
 * Проверяет, можно ли редактировать сообщение на основе времени создания.
 *
 * @param ctx - Контекст обратного вызова.
 * @returns `true`, если сообщение можно редактировать; в противном случае `false`.
 */
export async function canEditMessage(ctx: AnyContext) {
  const session = await ctx.session;
  const messagesAfter = session.recentMessageIds.filter(
    (id) => id > (ctx.callbackQuery?.message?.message_id || Infinity)
  );

  const currentTime = Date.now() / 1000;
  const messageTimestamp = ctx.callbackQuery?.message?.date || 0;
  const maxTimeDifference = 60 * 5;

  return (
    currentTime - messageTimestamp < maxTimeDifference &&
    messagesAfter.length == 0
  );
}

/**
 * Удаляет сообщения после текущего
 * @param ctx - Контекст сообщения.
 */
export async function clearMessagesAfter(ctx: AnyContext) {
  const messageId = ctx.callbackQuery?.message?.message_id;
  if (!messageId) return;

  const session = await ctx.session;
  const index = session.recentMessageIds.indexOf(messageId);
  if (index === -1) return;

  const needCleanMessageIds = session.recentMessageIds.slice(index);
  session.commandMessageIds = session.commandMessageIds.filter(
    (id) => !needCleanMessageIds.includes(id)
  );

  return await clearMessages(ctx, needCleanMessageIds);
}

/**
 * Обрабатывает сообщения и управляет сессией.
 * @param ctx - Контекст сообщения.
 * @param message - Текстовое сообщение.
 */
export default async function messageManager(
  ctx: AnyContext,
  message?: Message.TextMessage
): Promise<void> {
  const session = await ctx.session;

  await (message
    ? handleSendMessage(session, message)
    : handleNewMessage(ctx, session));
}

/**
 * Обрабатывает отправленное текстовое сообщение.
 * @param session - Сессия пользователя.
 * @param message - Текстовое сообщение.
 */
async function handleSendMessage(
  session: SessionData,
  message: Message.TextMessage
) {
  session.recentMessageIds.push(message.message_id);
}

/**
 * Обрабатывает новое текстовое сообщение.
 * @param ctx - Контекст сообщения.
 * @param session - Сессия пользователя.
 */
async function handleNewMessage(ctx: AnyContext, session: SessionData) {
  const isCommand = "command" in ctx && !ctx.message.via_bot;
  if (isCommand && ctx.command === "start") {
    session.commandMessageIds = [ctx.message.message_id];
    await clearMessages(ctx, session.recentMessageIds);
    session.recentMessageIds = [ctx.message.message_id];
  } else if (isCommand) {
    session.commandMessageIds.push(ctx.message.message_id);
    session.recentMessageIds.push(ctx.message.message_id);
  } else if (ctx.message) {
    session.recentMessageIds.push(ctx.message.message_id);
  }

  const index = commandIndex(
    session.commandMessageIds,
    session.recentMessageIds
  );
  await clearMessages(ctx, session.recentMessageIds.slice(index));
}

/**
 * Находит индекс последней команды.
 * @param commandMessageIds - Массив идентификаторов командных сообщений.
 * @param recentMessageIds - Массив идентификаторов последних сообщений.
 * @returns Индекс последней команды.
 */
function commandIndex(commandMessageIds: number[], recentMessageIds: number[]) {
  const lastCommandMessageId = commandMessageIds[commandMessageIds.length - 1];
  return recentMessageIds.indexOf(lastCommandMessageId) + 1;
}

/**
 * Очищает сообщения пользователя.
 * @param ctx - Контекст сообщения.
 * @param messageIds - Массив идентификаторов сообщений.
 */
async function clearMessages(ctx: AnyContext, messageIds: number[]) {
  for (const messageId of messageIds) {
    await ctx.deleteMessage(messageId).catch(() => void 0);
  }
}

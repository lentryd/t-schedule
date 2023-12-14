import { Message } from "telegraf/types";
import TelegramBot from "../bot";
import Wrapper from "../utils/wrapper";
import getText from "../utils/locales";
import messageManager from "../utils/messageManager";
import { updateStudentList } from "../synchronizeCalendar";
import { createCalendar, createRule } from "../utils/calendar";
import { providersCollection, studentList } from "../utils/database";

export default async function auth(this: TelegramBot, ctx: CommandContext) {
  const user = await ctx.user;
  const { payload } = ctx;
  const { language_code } = ctx.from;
  const [userName, password] = payload.split(" ");
  if (!userName || !password) {
    return ctx
      .reply(
        getText(
          !user.providerId ? "auth_message" : "auth_update",
          language_code
        ),
        { parse_mode: "Markdown" }
      )
      .then((msg) => messageManager(ctx, msg));
  }

  // Пытаемся авторизоваться
  const message = await ctx
    .reply(getText("auth_process", language_code))
    .then((msg) => (messageManager(ctx, msg), msg));
  const userData = await Wrapper.tryAuth(userName, password);
  if (!userData) {
    return editMessage(ctx, message, getText("auth_error", language_code));
  }

  // Сохраняем данные
  user.studentId = userData.studentId;
  user.educationSpaceId = userData.spaceId;

  try {
    const providerDate = {
      userName,
      password,
      accessToken: userData.accessToken,
      educationSpaceId: userData.spaceId,
    };

    if (user.providerId)
      await providersCollection.doc(user.providerId).update(providerDate);
    else
      await providersCollection
        .add(providerDate)
        .then(({ id }) => (user.providerId = id));

    await updateStudentList(true);
  } catch (e) {
    console.error(e);
  }

  // Создаем календарь
  await editMessage(
    ctx,
    message,
    user.calendarId
      ? getText("calendar_update", language_code)
      : getText("calendar_process", language_code)
  );
  const student = studentList.find((s) => s.id === userData.studentId);
  user.calendarId ??= await createCalendar({
    summary: student?.shortName ?? ctx.from.first_name,
  }).catch((err) => (console.error(err), undefined));
  if (!user.calendarId) {
    return editMessage(ctx, message, getText("calendar_error", language_code));
  }
  await createRule(user.calendarId, userName)
    .then(() => (user.scheduleColorize = true))
    .catch(console.error);

  await ctx.deleteMessage(message.message_id);
  return await this.commandStart(ctx);
}

function editMessage(
  ctx: CommandContext,
  message: Message.TextMessage,
  text: string
) {
  return ctx.telegram.editMessageText(
    message.chat.id,
    message.message_id,
    undefined,
    text,
    { parse_mode: "Markdown" }
  );
}

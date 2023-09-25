import { Markup } from "telegraf";
import { CallbackContext } from "../context";
import { studentList } from "../utils/database";
import { createCalendar } from "../utils/calendar";
import calendarInfo from "../messages/calendarInfo";
import messageManager, {
  canEditMessage,
  clearMessagesAfter,
} from "../utils/messageManager";

const ERROR_MESSAGE =
  "Произошла ошибка 😔\nПопробуйте снова через некоторое время";
const ERROR_KEYBOARD = Markup.inlineKeyboard([
  Markup.button.switchToCurrentChat("Попробовать снова", ""),
]);
const WAIT_MESSAGE = "Создаю календарь, пожалуйста, подождите";

export default async function callbackStudent(ctx: CallbackContext) {
  const { data } = ctx.callbackQuery;
  const studentId = parseInt(data);
  const student = studentList.find((s) => s.id === studentId);

  if (!student) return await handleError(ctx, ERROR_MESSAGE);

  await ctx.answerCbQuery(WAIT_MESSAGE);
  if (await canEditMessage(ctx)) {
    await ctx.editMessageText(WAIT_MESSAGE);
  } else {
    await clearMessagesAfter(ctx);
    await ctx.reply(WAIT_MESSAGE).then((message) => {
      ctx.callbackQuery.message = message;
      return messageManager(ctx, message);
    });
  }

  const user = await ctx.user;
  const calendarId =
    user.calendarId ??
    (await createCalendar({ summary: student.shortName }).catch((err) =>
      console.error(err)
    ));
  if (!calendarId) return await handleError(ctx, ERROR_MESSAGE);

  user.studentId = studentId;
  user.calendarId = calendarId;
  user.educationSpaceId = student.spaceID;

  return await calendarInfo(ctx, "Ваш календарь готов!");
}

async function handleError(ctx: CallbackContext, errorMessage: string) {
  if (await canEditMessage(ctx)) {
    return await ctx.editMessageText(errorMessage, ERROR_KEYBOARD);
  }

  await clearMessagesAfter(ctx);
  return await ctx
    .reply(errorMessage, ERROR_KEYBOARD)
    .then((message) => messageManager(ctx, message));
}

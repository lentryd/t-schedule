import { join } from "path";
import { fmt, bold, code } from "telegraf/format";
import { CallbackContext } from "../context";
import calendarInfo from "../messages/calendarInfo";
import messageManager, { clearMessagesAfter } from "../utils/messageManager";

const MESSAGES = [
  {
    text: bold("Инструкция по добавлению календаря в Apple Calendar"),
  },

  {
    photo: join(__dirname, "../assets/first_step.png"),
    text: '2. В приложении "Календарь" нажмите "Календари"',
  },

  {
    photo: join(__dirname, "../assets/second_step.png"),
    text: '3. Нажмите "Добавить календарь"',
  },

  {
    photo: join(__dirname, "../assets/third_step.png"),
    text: '4. Нажмите "Добавить подписной календарь"',
  },

  {
    photo: join(__dirname, "../assets/fourth_step.png"),
    text: '5. Вставьте ссылку на календарь\n6. Нажмите "Подписаться"\n7. Нажмите "Добавить"',
  },
];

export default async function callbackICal(ctx: CallbackContext) {
  const user = await ctx.user;
  if (!user.calendarId) return await calendarInfo(ctx);

  MESSAGES[0].text = fmt`${bold(
    "Инструкция по добавлению календаря в Apple Calendar"
  )}\n\n1. Скопируйте ссылку вашего календаря:\n${code(
    `https://calendar.google.com/calendar/ical/${user.calendarId}/public/basic.ics`
  )}`;

  await clearMessagesAfter(ctx);
  for (const { photo, text } of MESSAGES) {
    await (!photo
      ? ctx.reply(text)
      : ctx.replyWithPhoto({ source: photo }, { caption: text })
    ).then((message) => messageManager(ctx, message));
  }
}

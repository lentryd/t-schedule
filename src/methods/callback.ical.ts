import { fmt, bold, code } from "telegraf/format";
import { CallbackContext } from "../context";
import calendarInfo from "../messages/calendarInfo";
import messageManager, { clearMessagesAfter } from "../utils/messageManager";

export default async function callbackICal(ctx: CallbackContext) {
  const user = await ctx.user;
  if (!user.calendarId) return await calendarInfo(ctx);

  await clearMessagesAfter(ctx);
  return await ctx
    .replyWithVideo(
      "https://drive.google.com/uc?id=1IXNCIeRYVuL624KDmE2wLOFsKPOUTb_Z&export=download",
      {
        caption: fmt`
          ${bold(
            "Инструкция по добавлению календаря в Apple iCalendar"
          )}\n\n1. Скопируйте ссылку вашего календаря:\n${code(
          `https://calendar.google.com/calendar/ical/${user.calendarId}/public/basic.ics`
        )}\n2. В приложении "Календарь" нажмите "Календари"\n3. Нажмите "Добавить\n4. Нажмите "Добавить подписной календарь"\n5. Вставьте ссылку на календарь\n6. Нажмите "Подписаться"\n7. Нажмите "Добавить"
        `,

        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Google Calendar",
                url: `https://calendar.google.com/calendar/render?cid=${user.calendarId}`,
              },
            ],
          ],
        },
      }
    )
    .then((message) => messageManager(ctx, message));
}

import { Markup } from "telegraf";
import getText from "./locales";
import TelegramBot from "../bot";
import messageManager, {
  canEditMessage,
  clearMessagesAfter,
} from "./messageManager";

export async function sendWelcomeMessage(this: TelegramBot, ctx: AnyContext) {
  const user = await ctx.user;

  const text = getText(
    user.calendarId ? "calendar_info" : "welcome_message",
    ctx.from?.language_code
  );
  const keyboard = !user.calendarId
    ? Markup.inlineKeyboard([
        [
          Markup.button.switchToCurrentChat(
            getText("create_calendar", ctx.from?.language_code),
            ""
          ),
        ],
      ])
    : Markup.inlineKeyboard([
        [
          Markup.button.url(
            getText("google_calendar", ctx.from?.language_code),
            `https://calendar.google.com/calendar/render?cid=${user.calendarId}`
          ),
          Markup.button.callback(
            getText("apple_calendar", ctx.from?.language_code),
            `iCal`
          ),
        ],
        [
          user.scheduleColorize
            ? Markup.button.switchToChat(
                getText("share_calendar", ctx.from?.language_code),
                ""
              )
            : Markup.button.callback(
                getText("colorize_calendar", ctx.from?.language_code),
                "colorize"
              ),
        ],
      ]);

  if (await canEditMessage(ctx)) {
    return await ctx.editMessageText(text, keyboard);
  }

  await clearMessagesAfter(ctx);
  return await ctx
    .reply(text, keyboard)
    .then((msg) => messageManager(ctx, msg));
}

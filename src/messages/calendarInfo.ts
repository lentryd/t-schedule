import { Markup } from 'telegraf';

import { AnyContext } from '@/context';
import messageManager, { canEditMessage, clearMessagesAfter } from '@/utils/messageManager';

/**
 * Отправляет информацию о календаре пользователю и предоставляет соответствующие действия.
 */
export default async function calendarInfo(ctx: AnyContext, additionalMessage = ''): Promise<void> {
    const user = await ctx.user;
    const session = await ctx.session;

    session.state = user.calendarId ? 'done' : 'set_student';

    if (additionalMessage !== '') additionalMessage += '\n\n';

    const welcomeMessage = !user.calendarId
        ? 'Я помогу вам перенести ваше расписание в Google Calendar и Apple iCalendar.'
        : 'С помощью кнопок ниже, вы можете легко добавить ваше расписание в Google Calendar или Apple iCalendar.';
    const keyboard = Markup.inlineKeyboard([
        !user.calendarId
            ? []
            : [
                  Markup.button.url(
                      'Google Calendar',
                      `https://calendar.google.com/calendar/render?cid=${user.calendarId}`
                  ),

                  Markup.button.callback('Apple iCalendar', `iCal`),
              ],

        user.calendarId
            ? [Markup.button.switchToChat('Поделиться расписанием', '')]
            : [Markup.button.switchToCurrentChat('Перенести расписание', '')],

        user.hasEnteredEmail || !user.calendarId ? [] : [Markup.button.callback('Разукрасить календарь', 'set_email')],
    ]);

    if (await canEditMessage(ctx)) {
        await ctx.editMessageText(additionalMessage + welcomeMessage, keyboard);
    } else {
        await clearMessagesAfter(ctx);
        await ctx.reply(additionalMessage + welcomeMessage, keyboard).then((message) => messageManager(ctx, message));
    }
}

import { InlineContext } from '@/context';

const TIP_TITLE = 'Поделиться расписанием';
const TIP_DESCRIPTION = 'Нажмите, чтобы поделиться расписанием';
const TIP_MESSAGE = 'Вот мое расписание. Если ты хочешь создать подобное, используй @t_schedule_bot.';

/**
 * Inline-ответ для шаринга расписания.
 * @param ctx InlineContext
 * @returns Promise<void>
 */
export default async function inlineShare(ctx: InlineContext): Promise<void> {
    if (!ctx.inlineQuery.chat_type || ctx.inlineQuery.chat_type !== 'private') return;

    const user = await ctx.user;

    if (!user.calendarId) return;

    await ctx.answerInlineQuery(
        [
            {
                id: 'tip',
                type: 'article',
                title: TIP_TITLE,
                description: TIP_DESCRIPTION,
                input_message_content: {
                    message_text: TIP_MESSAGE,
                },
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Google Calendar',
                                url: `https://calendar.google.com/calendar/render?cid=${user.calendarId}`,
                            },
                            {
                                text: 'Apple iCalendar',
                                url: `https://calendar.google.com/calendar/ical/${user.calendarId}/public/basic.ics`,
                            },
                        ],
                    ],
                },
            },
        ],
        { is_personal: true }
    );
}

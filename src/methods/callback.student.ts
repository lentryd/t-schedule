import { Markup } from 'telegraf';

import { CallbackContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';
import { createCalendar } from '@/utils/calendar';
import { studentList } from '@/utils/database';
import messageManager, { canEditMessage, clearMessagesAfter } from '@/utils/messageManager';

const ERROR_MESSAGE = 'Произошла ошибка 😔\nПопробуйте снова через некоторое время';
const ERROR_KEYBOARD = Markup.inlineKeyboard([Markup.button.switchToCurrentChat('Попробовать снова', '')]);
const WAIT_MESSAGE = 'Создаю календарь, пожалуйста, подождите';

/**
 * Обрабатывает callback для выбора студента и создания календаря.
 * @param ctx Контекст callback
 * @returns Promise<void>
 */
export default async function callbackStudent(ctx: CallbackContext): Promise<void> {
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
        user.calendarId ?? (await createCalendar({ summary: student.shortName }).catch((err) => console.error(err)));

    if (!calendarId) return await handleError(ctx, ERROR_MESSAGE);

    user.studentId = studentId;
    user.calendarId = calendarId;
    user.educationSpaceId = student.spaceID;

    return await calendarInfo(ctx, 'Ваш календарь готов!');
}

/**
 * Обрабатывает ошибку и отправляет сообщение пользователю.
 * @param ctx Контекст callback
 * @param errorMessage Сообщение об ошибке
 * @returns Promise<void>
 */
async function handleError(ctx: CallbackContext, errorMessage: string): Promise<void> {
    if (await canEditMessage(ctx)) {
        await ctx.editMessageText(errorMessage, ERROR_KEYBOARD);
        return;
    }

    await clearMessagesAfter(ctx);
    await ctx.reply(errorMessage, ERROR_KEYBOARD).then((message) => messageManager(ctx, message));
    return;
}

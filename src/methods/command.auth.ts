import { Markup } from 'telegraf';
import { code, fmt } from 'telegraf/format';
import { Message } from 'telegraf/types';

import { CommandContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';
import { createCalendar, createRule } from '@/utils/calendar';
import { providersCollection, studentList } from '@/utils/database';
import messageManager from '@/utils/messageManager';
import Wrapper from '@/utils/wrapper';

import { updateStudentList } from '../synchronizeCalendar';

/**
 * Авторизация пользователя через команду /auth.
 * @param ctx Контекст команды
 * @returns Promise<void>
 */
export default async function commandAuth(ctx: CommandContext): Promise<void> {
    await messageManager(ctx);

    const { payload } = ctx;
    const [userName, password] = payload.split(' ');

    if (!payload || !userName || !password) {
        return await ctx
            .reply(
                fmt`Для авторизации, введите команду /auth с вашим логином и паролем от личного кабинета на edu.donstu.ru, в формате ${code(
                    '/auth login password'
                )}, где ${code('login')} - ваш логин, а ${code(
                    'password'
                )} - ваш пароль.\n\nПример:\n/auth example@gmail.com 123456`
            )
            .then((message) => messageManager(ctx, message));
    }

    const message = await ctx.reply('Проверяю данные, пожалуйста, подождите');
    const data = await Wrapper.tryAuth(userName, password);

    if (!data) {
        return await handleError(ctx, message, 'Произошла ошибка 😔\nПопробуйте повторить попытку позже.');
    }

    const user = await ctx.user;

    user.studentId = data.studentId;
    user.educationSpaceId = data.spaceId;

    try {
        await providersCollection.add({
            userId: ctx.from.id,
            userName,
            password,
            accessToken: data.accessToken,
            educationSpaceId: data.spaceId,
        });
        await updateStudentList(true);
    } catch (e) {
        console.error(e);
    }

    const student = studentList.find((s) => s.id === data.studentId);

    user.calendarId ??= await createCalendar({
        summary: student?.shortName ?? ctx.from.first_name,
    }).catch((err) => (console.error(err), undefined));

    if (!user.calendarId) {
        return await handleError(ctx, message, 'Произошла ошибка 😔\nПопробуйте повторить попытку позже.');
    }

    await createRule(user.calendarId, userName).catch((err) => console.error(err));

    await ctx.deleteMessage(message.message_id);
    return await calendarInfo(ctx, 'Вы успешно авторизовались!');
}

/**
 * Обрабатывает ошибку авторизации и отправляет сообщение.
 * @param ctx Контекст команды
 * @param message Сообщение для редактирования
 * @param errorMessage Текст ошибки
 * @returns Promise<void>
 */
async function handleError(ctx: CommandContext, message: Message.TextMessage, errorMessage: string): Promise<void> {
    try {
        await ctx.telegram.editMessageText(
            message.chat.id,
            message.message_id,
            ctx.inlineMessageId,
            errorMessage,
            Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')])
        );
    } catch (e) {
        console.error(e);
        await ctx.deleteMessage(message.message_id).catch(() => void 0);
        return await ctx
            .reply(errorMessage, Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')]))
            .then((message) => messageManager(ctx, message));
    }
}

import { Markup } from 'telegraf';

import { TextContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';
import { createRule } from '@/utils/calendar';
import messageManager from '@/utils/messageManager';

const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

/**
 * Обрабатывает ввод текста для настройки электронной почты пользователя.
 * @param ctx - Контекст текстового сообщения.
 * @returns Ответ бота на ввод пользователя.
 */
export default async function textEmail(ctx: TextContext): Promise<void> {
    const user = await ctx.user;

    if (!user.calendarId) {
        await ctx
            .reply(
                'Похоже у вас нет календаря. Однако вы можете создать его, введя команду /student или воспользовавшись кнопкой ниже.',

                Markup.inlineKeyboard([Markup.button.switchToCurrentChat('Создать календарь', '')])
            )
            .then((message) => messageManager(ctx, message));
        return;
    }

    const email = ctx.message.text.match(emailRegex)?.[0];

    if (!email) {
        return await ctx
            .reply(
                'Для настройки цветов в вашем календаре, введите адрес электронной почты, привязанный к вашему Google-аккаунту, который используется для управления календарем.\n\nПример:\nexample@gmail.com',
                Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')])
            )
            .then((message) => messageManager(ctx, message));
    }

    const message = await ctx.reply('Добавляю почту, пожалуйста, подождите...');
    const ruleId = await createRule(user.calendarId, email).catch((err) => console.error(err));

    if (!ruleId) {
        await ctx.telegram.editMessageText(
            message.chat.id,
            message.message_id,
            ctx.inlineMessageId,
            'Произошла ошибка 😔\nПопробуйте повторить попытку позже.',
            Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')])
        );
        return;
    }

    user.hasEnteredEmail = true;
    await ctx.deleteMessage(message.message_id);
    await calendarInfo(ctx, `Теперь расписание в профиле ${email} будет цветное`);
}

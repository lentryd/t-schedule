import { Markup } from 'telegraf';

import { CallbackContext } from '@/context';
import messageManager, { canEditMessage, clearMessagesAfter } from '@/utils/messageManager';

const MESSAGE =
    'Для настройки цветов в вашем календаре, введите адрес электронной почты, привязанный к вашему Google-аккаунту, который используется для управления календарем.';

/**
 * Обрабатывает нажатие кнопки для настройки цветового оформления календаря.
 */
export default async function callbackColorize(ctx: CallbackContext): Promise<void> {
    const session = await ctx.session;

    session.state = 'set_email';

    if (await canEditMessage(ctx)) {
        await ctx.editMessageText(MESSAGE, Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')]));
        return;
    }

    await clearMessagesAfter(ctx);
    await ctx
        .reply(MESSAGE, Markup.inlineKeyboard([Markup.button.callback('Отмена', 'cancel')]))
        .then((message) => messageManager(ctx, message));
}

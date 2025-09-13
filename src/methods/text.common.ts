import { TextContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';
import messageManager from '@/utils/messageManager';

import textEmail from './text.email';

/**
 * Обрабатывает текстовые сообщения пользователя.
 * @param ctx TextContext
 * @returns Promise<void>
 */
export default async function textCommon(ctx: TextContext): Promise<void> {
    await messageManager(ctx);

    const session = await ctx.session;

    switch (session.state) {
        case 'set_email':
            return await textEmail(ctx);

        default:
            return calendarInfo(ctx, 'Простите, я не понимаю вас. Попробуйте снова');
    }
}

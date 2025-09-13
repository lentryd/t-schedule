import { CallbackContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';

import callbackColorize from './callback.colorize';
import callbackICal from './callback.ical';
import callbackStudent from './callback.student';

/**
 * Обрабатывает общие колбэки и перенаправляет их к соответствующим обработчикам.
 */
export default async function callbackCommon(ctx: CallbackContext): Promise<void> {
    const { data } = ctx.callbackQuery;

    if (data === 'iCal') return await callbackICal(ctx);
    if (data === 'cancel') return await calendarInfo(ctx, 'Действие отменено!');

    const session = await ctx.session;

    switch (session.state) {
        case 'set_student':
            await callbackStudent(ctx);
            break;
        case 'done':
        case 'set_email':
            if (data === 'set_email') await callbackColorize(ctx);
            break;

        default:
            await ctx.answerCbQuery('Произошла ошибка, пожалуйста, повторите попытку', { show_alert: true });
            await calendarInfo(ctx);
    }
}

import { InlineContext } from '@/context';

import inlineShare from './inline.share';
import inlineStudent from './inline.student';

/**
 * Обрабатывает inline-запросы пользователя.
 * @param ctx InlineContext
 * @returns Promise<void>
 */
export default async function inlineCommon(ctx: InlineContext): Promise<void> {
    if (!ctx.inlineQuery.chat_type || !['sender', 'private'].includes(ctx.inlineQuery.chat_type)) return;

    const session = await ctx.session;

    switch (session.state) {
        case 'set_student':
            await inlineStudent(ctx);
            return;

        default:
            await inlineShare(ctx);
            return;
    }
}

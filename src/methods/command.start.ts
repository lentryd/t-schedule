import { CommandContext } from '@/context';
import calendarInfo from '@/messages/calendarInfo';
import messageManager from '@/utils/messageManager';

/**
 * Стартовая команда для инициализации календаря.
 * @param ctx Контекст команды
 * @returns Promise<void>
 */
export default async function commandStart(ctx: CommandContext): Promise<void> {
    await messageManager(ctx);
    return await calendarInfo(ctx);
}

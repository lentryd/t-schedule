import { Markup } from 'telegraf';

import { CommandContext } from '@/context';
import { Student } from '@/utils/database';
import { formatStudent } from '@/utils/format';
import messageManager from '@/utils/messageManager';

/**
 * Запрашивает у пользователя подтверждение выбранного студента.
 */
export default async function confirmStudent(ctx: CommandContext, student: Student): Promise<void> {
    const user = await ctx.user;
    const formattedStudent = formatStudent(student);
    const userFormattedStudent = (user.studentId && formatStudent(user.studentId)) || undefined;

    const confirmationMessage =
        (!userFormattedStudent
            ? ''
            : `${userFormattedStudent.fullName}\n${userFormattedStudent.department}\n\nЗаменить на\n\n`) +
        `${formattedStudent.fullName}\n${formattedStudent.department}\n\nВсе верно?`;

    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback('Да', student.id.toString()),
            ctx.message?.via_bot
                ? Markup.button.switchToCurrentChat('Нет', '')
                : Markup.button.callback('Нет', 'cancel'),
        ],
    ]);

    return await ctx.reply(confirmationMessage, keyboard).then((message) => messageManager(ctx, message));
}

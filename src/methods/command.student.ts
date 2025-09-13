import { Markup } from 'telegraf';

import { CommandContext } from '@/context';
import confirmStudent from '@/messages/confirmStudent';
import { studentList } from '@/utils/database';
import messageManager from '@/utils/messageManager';

/**
 * Команда для выбора студента.
 * @param ctx Контекст команды
 * @returns Promise<void>
 */
export default async function commandStudent(ctx: CommandContext): Promise<void> {
    await messageManager(ctx);

    const session = await ctx.session;

    session.state = 'set_student';

    const { payload } = ctx;
    const studentId = parseInt(payload);

    if (isNaN(studentId)) {
        return await ctx
            .reply(
                'Для указания идентификатора студента, введите команду /student и после неё укажите числовой идентификатор студента.\n\nПример:\n/student 123456',
                Markup.inlineKeyboard([Markup.button.switchToCurrentChat('Идентификация по фамилии', '')])
            )
            .then((message) => messageManager(ctx, message));
    }

    const student = studentList.find(({ id }) => id === studentId);

    if (!student) {
        return await ctx
            .reply(
                'Студент с указанным идентификатором не найден в базе данных. Пожалуйста, попробуйте выполнить аутентификацию с помощью команды /auth'
            )
            .then((message) => messageManager(ctx, message));
    }

    return await confirmStudent(ctx, student);
}

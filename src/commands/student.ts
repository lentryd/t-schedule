import { Markup } from "telegraf";
import TelegramBot from "../bot";
import getText from "../utils/locales";
import { formatStudent } from "../utils/format";

export default async function student(this: TelegramBot, ctx: CommandContext) {
  const session = await ctx.session;
  session.state = "set_student";

  const { payload } = ctx;
  const { language_code } = ctx.from;
  const studentId = parseInt(payload);
  if (isNaN(studentId)) {
    return await ctx.reply(
      getText("student_message", language_code),

      Markup.inlineKeyboard([
        Markup.button.switchToCurrentChat(
          getText("student_inline", language_code),
          ""
        ),
      ])
    );
  }

  const user = await ctx.user;
  const newStudent = formatStudent(studentId);
  const currentStudent = user.studentId && formatStudent(user.studentId);
  if (!newStudent) {
    return await ctx.reply(
      getText("student_not_found", language_code),
      Markup.inlineKeyboard([
        Markup.button.switchToCurrentChat(
          getText("student_inline", language_code),
          ""
        ),
      ])
    );
  }
}

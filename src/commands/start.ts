import TelegramBot from "../bot";
import { sendWelcomeMessage } from "../utils/messageSender";

export default async function start(this: TelegramBot, ctx: CommandContext) {
  const user = await ctx.user;
  const session = await ctx.session;
  session.state = user.calendarId ? "start" : "set_student";

  return await sendWelcomeMessage.call(this, ctx);
}

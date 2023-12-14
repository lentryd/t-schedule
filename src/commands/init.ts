import TelegramBot from "../bot";
import messageManager from "../utils/messageManager";

const ADMINS = process.env.BOT_ADMINS?.split(",") ?? [];

export default async function init(this: TelegramBot, ctx: CommandContext) {
  const isAdmin = ADMINS.includes(ctx.from.id.toString());
  if (!isAdmin)
    return await ctx
      .reply("You are not admin.")
      .then((msg) => messageManager(ctx, msg));

  await this.setName();
  await this.setCommands();
  await this.setCommands();

  return await ctx
    .reply("Bot initialized.")
    .then((msg) => messageManager(ctx, msg));
}

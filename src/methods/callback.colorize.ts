import { Markup } from "telegraf";
import { CallbackContext } from "../context";
import messageManager, {
  canEditMessage,
  clearMessagesAfter,
} from "../utils/messageManager";

const MESSAGE =
  "Для настройки цветов в вашем календаре, введите адрес электронной почты, привязанный к вашему Google-аккаунту, который используется для управления календарем.";

export default async function callbackColorize(ctx: CallbackContext) {
  const session = await ctx.session;
  session.state = "set_email";

  if (await canEditMessage(ctx)) {
    return await ctx.editMessageText(
      MESSAGE,
      Markup.inlineKeyboard([Markup.button.callback("Отмена", "cancel")])
    );
  }

  await clearMessagesAfter(ctx);
  return await ctx
    .reply(
      MESSAGE,
      Markup.inlineKeyboard([Markup.button.callback("Отмена", "cancel")])
    )
    .then((message) => messageManager(ctx, message));
}

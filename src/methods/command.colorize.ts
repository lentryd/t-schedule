import { Markup } from "telegraf";
import { CommandContext } from "../context";
import messageManager from "../utils/messageManager";

export default async function commandColorize(ctx: CommandContext) {
  await messageManager(ctx);

  const user = await ctx.user;
  if (!user.calendarId) {
    return await ctx
      .reply(
        "Эта команда предназначена для настройки цветов в вашем календаре. Однако, если у вас еще нет календаря, вы можете создать его, введя команду /student или воспользовавшись кнопкой ниже.",

        Markup.inlineKeyboard([
          Markup.button.switchToCurrentChat("Создать календарь", ""),
        ])
      )
      .then((message) => messageManager(ctx, message));
  }

  const session = await ctx.session;
  session.state = "set_email";
  if (user.hasEnteredEmail) {
    return await ctx
      .reply(
        "Цвета в вашем календаре уже настроены. Однако, если вы хотите добавить еще одного пользователя, нажмите кнопку ниже.",

        Markup.inlineKeyboard([
          Markup.button.callback("Добавить пользователя", "set_email"),
          Markup.button.callback("Отмена", "cancel"),
        ])
      )
      .then((message) => messageManager(ctx, message));
  }

  return await ctx
    .reply(
      "Для настройки цветов в вашем календаре, введите адрес электронной почты, привязанный к вашему Google-аккаунту, который используется для управления календарем.",

      Markup.inlineKeyboard([Markup.button.callback("Отмена", "cancel")])
    )
    .then((message) => messageManager(ctx, message));
}

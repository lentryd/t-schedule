import callbackStudent from "./callback.student";
import { CallbackContext } from "../context";
import callbackICal from "./callback.ical";
import calendarInfo from "../messages/calendarInfo";
import callbackColorize from "./callback.colorize";

export default async function callbackCommon(ctx: CallbackContext) {
  const { data } = ctx.callbackQuery;
  if (data == "iCal") return await callbackICal(ctx);
  if (data == "cancel") return await calendarInfo(ctx, "Действие отменено!");

  const session = await ctx.session;
  switch (session.state) {
    case "set_student":
      return await callbackStudent(ctx);

    case "done":
    case "set_email":
      if (data == "set_email") return await callbackColorize(ctx);

    default:
      await ctx.answerCbQuery(
        "Произошла ошибка, пожалуйста, повторите попытку",
        { show_alert: true }
      );
      return await calendarInfo(ctx);
  }
}

import textEmail from "./text.email";
import { TextContext } from "../context";
import calendarInfo from "../messages/calendarInfo";
import messageManager from "../utils/messageManager";

export default async function textCommon(ctx: TextContext) {
  await messageManager(ctx);

  const session = await ctx.session;
  switch (session.state) {
    case "set_email":
      return await textEmail(ctx);

    default:
      return calendarInfo(ctx, "Простите, я не понимаю вас. Попробуйте снова");
  }
}

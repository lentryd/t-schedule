import inlineShare from "./inline.share";
import inlineStudent from "./inline.student";
import { InlineContext } from "../context";

export default async function inlineCommon(ctx: InlineContext) {
  if (
    !ctx.inlineQuery.chat_type ||
    !["sender", "private"].includes(ctx.inlineQuery.chat_type)
  )
    return;

  const session = await ctx.session;
  switch (session.state) {
    case "set_student":
      return await inlineStudent(ctx);

    default:
      return await inlineShare(ctx);
  }
}

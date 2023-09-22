import { CommandContext } from "../context";
import calendarInfo from "../messages/calendarInfo";
import messageManager from "../utils/messageManager";

export default async function commandStart(ctx: CommandContext) {
  await messageManager(ctx);
  return await calendarInfo(ctx);
}

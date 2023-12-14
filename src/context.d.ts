import type { Context, NarrowedContext } from "telegraf";
import type { CallbackQuery, Message, Update } from "telegraf/types";
import type { SessionData, UserData } from "./utils/database";

declare global {
  export interface BotContext<U extends Update = Update> extends Context<U> {
    user: Promise<UserData>;
    session: Promise<SessionData>;
  }

  export type CommandContext = NarrowedContext<
    BotContext,
    Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
  > & {
    command: string;
    payload: string;
    args: string[];
  };

  export type TextContext = NarrowedContext<
    BotContext,
    Update.MessageUpdate<Record<"text", {}> & Message.TextMessage>
  >;

  export type CallbackContext = NarrowedContext<
    BotContext,
    Update.CallbackQueryUpdate<Record<"data", {}> & CallbackQuery.DataQuery>
  >;

  export type InlineContext = NarrowedContext<
    BotContext,
    Update.InlineQueryUpdate
  >;

  export type AnyContext = BotContext | CommandContext | CallbackContext;
}

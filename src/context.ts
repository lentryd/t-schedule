import { Context, NarrowedContext } from 'telegraf';
import { CallbackQuery, Message, Update } from 'telegraf/types';
import { MountMap } from 'telegraf/typings/telegram-types';

import { SessionData, UserData } from '@/utils/database';

export default interface CommonContext<U extends Update = Update> extends Context<U> {
    user: Promise<UserData>;
    session: Promise<SessionData>;
}

interface CommandContextExtn {
    /**
     * Matched command. This will always be the actual command, excluding preceeding slash and `@botname`
     *
     * Examples:
     * ```
     * /command abc -> command
     * /command@xyzbot abc -> command
     * ```
     */
    command: string;
    /**
     * The unparsed payload part of the command
     *
     * Examples:
     * ```
     * /command abc def -> "abc def"
     * /command "token1 token2" -> "\"token1 token2\""
     * ```
     */
    payload: string;
    /**
     * Command args parsed into an array.
     *
     * Examples:
     * ```
     * /command token1 token2 -> [ "token1", "token2" ]
     * /command "token1 token2" -> [ "token1 token2" ]
     * /command token1 "token2 token3" -> [ "token1" "token2 token3" ]
     * ```
     * @unstable Parser implementation might vary until considered stable
     * */
    args: string[];
}
export type CommandContext = NarrowedContext<CommonContext, MountMap['text']> & CommandContextExtn;

export type TextContext = NarrowedContext<
    CommonContext,
    Update.MessageUpdate<Record<'text', {}> & Message.TextMessage>
>;

export type CallbackContext = NarrowedContext<
    CommonContext,
    Update.CallbackQueryUpdate<Record<'data', {}> & CallbackQuery.DataQuery>
>;

export type InlineContext = NarrowedContext<CommonContext, Update.InlineQueryUpdate>;

export type AnyContext = CommonContext | CommandContext | CallbackContext;

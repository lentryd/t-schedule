import { CollectionReference } from '@google-cloud/firestore';
import { Context, Middleware } from 'telegraf';

interface Options<C> {
    name?: string;
    docKey?: string | ((ctx: C) => string | undefined) | ((ctx: C) => Promise<string | undefined>);
    defaultValue?: object | ((ctx: C) => object | undefined) | ((ctx: C) => Promise<object | undefined>);
}

/**
 * Middleware для управления сессиями с использованием Firestore.
 */
export default function firestoreMiddleware<C extends Context>(
    collection: CollectionReference,
    opts?: Options<C>
): Middleware<C> {
    const defaultOpts = {
        name: 'session',
        docKey: (ctx: C): string | undefined =>
            (ctx.from && ctx.from.id.toString()) || (ctx.inlineQuery?.from && ctx.inlineQuery.from.id.toString()),
    };
    const completeOpts = { ...defaultOpts, ...opts };

    return async (ctx, next) => {
        const options = {
            ...completeOpts,
            docKey: async (ctx: C): Promise<string | undefined> =>
                typeof completeOpts.docKey === 'function' ? completeOpts.docKey(ctx) : completeOpts.docKey,
            defaultValue: async (ctx: C): Promise<object | undefined> =>
                typeof completeOpts.defaultValue === 'function'
                    ? completeOpts.defaultValue(ctx)
                    : completeOpts.defaultValue,
        };

        const key = await options.docKey(ctx);

        if (key === undefined) return next?.();

        let data: {} | undefined;

        Object.defineProperty(ctx, options.name, {
            get: () =>
                new Promise(async (resolve) => {
                    if (data === undefined)
                        data = (await collection.doc(key).get()).data() ?? (await options.defaultValue(ctx));
                    resolve(data);
                }),
            set: (value) => (data = Object.assign({}, value)),
        });

        const n = await next?.();

        return data === undefined ? n : collection.doc(key).set(data);
    };
}

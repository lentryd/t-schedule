// Библиотеки и т.д.
import { schedule } from "node-cron";
import { Telegraf } from "telegraf";
import { message, callbackQuery } from "telegraf/filters";
// Утилиты для работы с ботом.
import Context from "./context";
import messageManager from "./utils/messageManager";
import firestoreMiddleware from "./utils/middleware";
import { sessionsCollection, usersCollection } from "./utils/database";
// Команды бота.
import commandAuth from "./methods/command.auth";
import commandStart from "./methods/command.start";
import commandStudent from "./methods/command.student";
import commandColorize from "./methods/command.colorize";
// Слушатели событий
import textCommon from "./methods/text.common";
import inlineCommon from "./methods/inline.common";
import callbackCommon from "./methods/callback.common";
import calendarInfo from "./messages/calendarInfo";
// Синхронизация календаря и обновление студентов.
import synchronizeCalendar, { updateStudentList } from "./synchronizeCalendar";

// Инициализация бота.
const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is not defined!");

const bot = new Telegraf<Context>(token);

// Подгружаем данные из базы данных
bot.use(
  // Сессия
  firestoreMiddleware(sessionsCollection, {
    name: "session",
    defaultValue: { state: "", recentMessageIds: [], commandMessageIds: [] },
  }),
  // Пользователь
  firestoreMiddleware(usersCollection, {
    name: "user",
    defaultValue: { lastScheduleUpdate: null, hasEnteredEmail: false },
  })
);

// Команды
bot.command("auth", commandAuth);
bot.command("start", commandStart);
bot.command("student", commandStudent);
bot.command("colorize", commandColorize);
// Слушатели событий
bot.on("inline_query", inlineCommon);
bot.on(message("text"), (ctx) => textCommon(ctx));
bot.on(callbackQuery("data"), (ctx) => callbackCommon(ctx));
bot.on("message", async (ctx) => {
  await messageManager(ctx);
  return await calendarInfo(ctx, "Простите, я не понимаю вас.");
});
bot.catch((err, ctx) => {
  console.error("Произошла ошибка: ", err);
  console.error("Контекст: ", ctx);
});

// Запускаем бота
const port = parseInt(process.env.PORT ?? "");
const domain = process.env.DOMAIN;
bot.launch(
  !domain || !port ? {} : { webhook: { domain, port, hookPath: "/bot" } }
);
console.log("bot started");

// Запускаем синхронизацию
schedule("* * * * *", () => {
  console.log("start synchronize");
  synchronizeCalendar().catch((err) => console.error(err));
  updateStudentList().catch((err) => console.error(err));
});

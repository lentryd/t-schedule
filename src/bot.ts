import { Telegraf } from "telegraf";
// Команды
import init from "./commands/init";
import start from "./commands/start";
// Утилиты
import getText from "./utils/locales";
import firestoreMiddleware from "./utils/middleware";
import { sessionsCollection, usersCollection } from "./utils/database";
import messageManager from "./utils/messageManager";
import auth from "./commands/auth";

export default class TelegramBot {
  protected bot: Telegraf<BotContext>;

  constructor(token: string) {
    this.bot = new Telegraf<BotContext>(token);

    //! Настройка образа
    // this.setName();
    // this.setCommands();
    // this.setDescription();

    //! Слушатели
    this.connectDatabase();
    this.updateMessageHistory();

    //! Регистрация команд
    this.registerCommands();
  }

  //! Работа
  /**
   * Запуск бота
   * @param config Конфигурация подключения
   */
  async start(config?: Telegraf.LaunchOptions) {
    await this.bot.launch(config);
    console.log("bot started");
  }

  /**
   * Остановить бота
   * @param reason Причина остановки
   */
  async stop(reason?: string) {
    this.bot.stop(reason);
    console.log("bot stopped");
  }

  /**
   * Устанавливаем имя бота
   */
  protected async setName() {
    // Имя бота
    this.bot.telegram.setMyName(getText("name"));

    // Имя бота (ru)
    this.bot.telegram.setMyName(getText("name", "ru"), "ru");
  }

  /**
   * Устанавливаем описание команд
   */
  protected async setCommands() {
    // Очищаем старые команды для всех
    await this.bot.telegram.deleteMyCommands();

    // Очищаем старые команды для личных чатов
    await this.bot.telegram.deleteMyCommands({
      scope: { type: "all_private_chats" },
    });
    // Описание
    await this.bot.telegram.setMyCommands(
      [
        {
          command: "/start",
          description: getText("command_start"),
        },
        {
          command: "/auth",
          description: getText("command_auth"),
        },
        {
          command: "/student",
          description: getText("command_student"),
        },
        {
          command: "/colorize",
          description: getText("command_colorize"),
        },
      ],
      { scope: { type: "all_private_chats" } }
    );

    // Очищаем старые команды для личных чатов (ru)
    await this.bot.telegram.deleteMyCommands({
      scope: { type: "all_private_chats" },
      language_code: "ru",
    });
    // Описание (ru)
    await this.bot.telegram.setMyCommands(
      [
        {
          command: "/start",
          description: getText("command_start", "ru"),
        },
        {
          command: "/auth",
          description: getText("command_auth", "ru"),
        },
        {
          command: "/student",
          description: getText("command_student", "ru"),
        },
        {
          command: "/colorize",
          description: getText("command_colorize", "ru"),
        },
      ],
      { scope: { type: "all_private_chats" }, language_code: "ru" }
    );
  }

  /**
   * Устанавливаем описание бота
   */
  protected async setDescription() {
    // Описание бота
    await this.bot.telegram.setMyDescription(getText("description"));
    // Описание профиля
    await this.bot.telegram.setMyShortDescription(
      getText("profile_description")
    );

    // Описание бота (ru)
    await this.bot.telegram.setMyDescription(
      getText("description", "ru"),
      "ru"
    );
    // Описание профиля (ru)
    await this.bot.telegram.setMyShortDescription(
      getText("profile_description", "ru"),
      "ru"
    );
  }

  /**
   * Подключение базы данных
   */
  private async connectDatabase() {
    this.bot.use(
      // Пользователи
      firestoreMiddleware(usersCollection, {
        name: "user",
        defaultValue: { lastScheduleUpdate: null, hasEnteredEmail: false },
      }),
      // Сессия
      firestoreMiddleware(sessionsCollection, {
        name: "session",
        defaultValue: {
          state: "",
          recentMessageIds: [],
          commandMessageIds: [],
        },
      })
    );
  }

  /**
   * Обновление истории сообщений
   */
  private async updateMessageHistory() {
    this.bot.on("message", async (ctx, next) => {
      await messageManager(ctx);
      return next();
    });
  }

  //! Команды
  /**
   * Инициализация бота
   * @param ctx
   */
  protected commandInit(ctx: CommandContext) {
    return init.call(this, ctx);
  }

  /**
   * Авторизация в боте
   * @param ctx
   * @returns
   */
  protected commandAuth(ctx: CommandContext) {
    return auth.call(this, ctx);
  }

  /**
   * Запуск бота
   * @param ctx
   * @returns
   */
  protected commandStart(ctx: CommandContext) {
    return start.call(this, ctx);
  }

  private async registerCommands() {
    this.bot.command("init", (ctx) => this.commandInit(ctx));
    this.bot.command("auth", (ctx) => this.commandAuth(ctx));
    this.bot.command("start", (ctx) => this.commandStart(ctx));
  }
}

# T-Schedule Bot

T-Schedule Bot - это Telegram-бот, разработанный для переноса расписания с [edu.donstu.ru](https://edu.donstu.ru) в Google Calendar. Этот бот автоматизирует процесс управления расписанием и помогает студентам быть в курсе своих учебных занятий.

## Описание проекта

T-Schedule Bot предоставляет следующие ключевые функции:

- Перенос расписания с [edu.donstu.ru](https://edu.donstu.ru) в Google Calendar.
- Возможность настройки цветовых меток для разных видов занятий.
- Ручная установка и обновление ID студента.
- Автоматическое обновление расписания каждые 15 минут в учебное время.

## Использование бота

### Команда /start

Команда `/start` запускает бота и отправляет ссылку на ваш календарь (если такой есть).

### Команда /auth

Команда `/auth` необходима для авторизации в боте. Следуйте инструкциям для входа в ваш аккаунт на [edu.donstu.ru](https://edu.donstu.ru).

### Команда /student

Команда `/student` позволяет вручную установить ID студента для получения расписания.

### Команда /colorize

Команда `/colorize` позволяет настроить цветовые метки для занятий в вашем календаре.

## Поддерживаемые платформы

T-Schedule Bot поддерживает Telegram как платформу для взаимодействия. Вы можете [добавить бота](https://t.me/t_schedule_bot) к себе в Телеграме и начать использовать его.

## Тестирование и разработка

Следующие инструкции помогут вам запустить этого бота на вашем локальном компьютере для разработки и тестирования.

### Предварительные условия

Для установки и использования этого бота вам понадобятся:

- Node.js ≥ v10.24.1 ([установить](https://nodejs.org/ru/download/))

### Установка

1. Скопируйте репозиторий с ботом:

```bash
git clone https://github.com/lentryd/t-schedule.git
cd t-schedule
```

2. Установите зависимости с помощью `npm`:

```bash
npm i
```

3. Создайте файл `.env` в корне проекта и добавьте в него следующие переменные:

```env
BOT_TOKEN=ваш_токен_бота
```

5. Создайте проект в [Google Cloud Platform](https://console.cloud.google.com/)
6. Подключите [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
7. Подключите [Google Cloud Firestore API](https://console.cloud.google.com/apis/library/firestore.googleapis.com)
8. Создайте [Service Account](https://console.cloud.google.com/iam-admin/serviceaccounts/create)
9. Выберите свою учетную запись службы
10. Нажмите «Ключи» > «Добавить ключ» > «Создать новый ключ»
11. Выберите JSON , затем нажмите «Создать» <br>
    Ваша новая пара открытого/закрытого ключей генерируется и загружается на ваш компьютер в виде нового файла. Сохраните загруженный файл JSON как `credentials.json` в своем рабочем каталоге.
12. Запустите бота:

```bash
npm run start
```

## Зависимости

- [dotenv](https://www.npmjs.com/package/dotenv) - Модуль с нулевой зависимостью, который загружает переменные окружения из файла `.env` в `process.env`
- [telegraf](https://www.npmjs.com/package/telegraf) - Современный фреймворк Telegram Bot API для Node.js
- [node-fetch](https://www.npmjs.com/package/node-fetch) - Fetch API в Node.js
- [@googleapis/calendar](https://www.npmjs.com/package/@googleapis/calendar) - API Google Calendar позволяет вам управлять своими календарями и событиями
- [@google-cloud/firestore](https://www.npmjs.com/package/@google-cloud/firestore) - Node.js Серверный SDK для [Google Cloud Firestore](https://firebase.google.com/docs/firestore/)

## Управление версиями

Версии этой библиотеки управляются согласно [SemVer](http://semver.org/). Список доступных версий можно найти в разделе [теги](https://github.com/lentryd/t-schedule/tags).

## Авторы

- [lentryd](https://github.com/lentryd)

Также посмотрите список [участников](https://github.com/lentryd/t-schedule/contributors), которые внесли свой вклад в проект.

## Лицензия

Этот проект распространяется под лицензией MIT. Подробную информацию смотрите в файле [LICENSE](LICENSE).

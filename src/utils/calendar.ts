import * as GCalendar from "@googleapis/calendar";

// Типы значений по умолчанию
export type DefaultRuleOptions = GCalendar.calendar_v3.Schema$AclRule;
export type DefaultEventOptions = GCalendar.calendar_v3.Schema$Event;
export type DefaultCalendarOptions = GCalendar.calendar_v3.Schema$Calendar;

// Значения по умолчанию
const DEFAULT_RULE_OPTIONS: DefaultRuleOptions = {
  role: "reader",
  scope: { type: "default" },
};
const DEFAULT_EVENT_OPTIONS: DefaultEventOptions = {
  summary: "Lesson",
  location: "Moscow, Russia",
  description: "Generated and updating by @t_schedule_bot",

  colorId: "1",
  start: {
    dateTime: new Date().toISOString(),
    timeZone: "Europe/Moscow",
  },
  end: {
    dateTime: new Date().toISOString(),
    timeZone: "Europe/Moscow",
  },
};
const DEFAULT_CALENDAR_OPTIONS: DefaultCalendarOptions = {
  summary: "New Schedule",
  timeZone: "Europe/Moscow",
  description: "Сгенерировано и обновляется @t_schedule_bot",
};

// Авторизация на Google Calendar
const auth = new GCalendar.auth.GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ],
  keyFilename: "token.json",
});
const calendar = GCalendar.calendar({ version: "v3", auth });

// Календарь
export async function createCalendar(params?: DefaultCalendarOptions) {
  // Добираем параметры по умолчанию
  params = { ...DEFAULT_CALENDAR_OPTIONS, ...params };

  // Создаем календарь
  const calendarRes = await calendar.calendars.insert({ requestBody: params });
  const calendarId = calendarRes.data.id;
  if (!calendarId) throw new Error("Calendar ID not found");

  // Открываем доступ к календарю
  const ruleId = await createRule(calendarId).catch((err) => {
    console.error("Ошибка открытия календаря: ", err);
    return undefined;
  });
  if (!ruleId) throw new Error("Unable to create calendar due to Acl error");

  return calendarId;
}
export async function deleteCalendar(calendarId: string) {
  await calendar.calendars.delete({ calendarId });
}

// Правила
export async function createRule(
  calendarId: string,
  params?: DefaultRuleOptions
) {
  // Добираем параметры по умолчанию
  params = { ...DEFAULT_RULE_OPTIONS, ...params };

  // Создаем правило доступа к календарю
  const aclRes = await calendar.acl.insert({
    calendarId,
    requestBody: params,
    sendNotifications: false,
  });
  const ruleId = aclRes.data.id;

  if (!ruleId) throw new Error("Rule ID not found");
  return ruleId;
}
export async function deleteRule(calendarId: string, ruleId: string) {
  await calendar.acl.delete({ calendarId, ruleId });
}

// События
export async function listEvent(calendarId: string, start?: Date, end?: Date) {
  if (!start) {
    start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  if (!end) {
    end = new Date(start);
    end.setMonth(end.getMonth() + 2);
    end.setHours(23, 59, 59, 999);
    end.setDate(0);
  }

  const events = await calendar.events.list({
    calendarId,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 400,
    singleEvents: true,
  });
  return events.data.items ?? [];
}
export async function createEvent(
  calendarId: string,
  params?: DefaultEventOptions
) {
  // Добираем параметры по умолчанию
  params = { ...DEFAULT_EVENT_OPTIONS, ...params };
  delete params.id;
  delete params.etag;

  // Создаем событие
  const eventRes = await calendar.events.insert({
    calendarId,
    requestBody: params,
  });
  const eventId = eventRes.data.id;
  if (!eventId) throw new Error("Event ID not found");

  return eventId;
}
export async function updateEvent(
  calendarId: string,
  params?: DefaultEventOptions
) {
  // Добираем параметры по умолчанию
  params = { ...DEFAULT_EVENT_OPTIONS, ...params };
  const eventId = params.id;
  if (!eventId) throw new Error("Event ID not found");
  delete params.id;
  delete params.etag;
  // Изменяем событие
  return await calendar.events.update({
    calendarId,
    eventId,
    requestBody: params,
  });
}
export async function deleteEvent(calendarId: string, eventId: string) {
  await calendar.events.delete({ calendarId, eventId });
}

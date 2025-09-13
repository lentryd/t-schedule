import * as GCalendar from '@googleapis/calendar';

// Типы значений по умолчанию
export type DefaultRuleOptions = GCalendar.calendar_v3.Schema$AclRule;
export type DefaultEventOptions = GCalendar.calendar_v3.Schema$Event;
export type DefaultCalendarOptions = GCalendar.calendar_v3.Schema$Calendar;

// Значения по умолчанию
const DEFAULT_RULE_OPTIONS: DefaultRuleOptions = {
    role: 'reader',
    scope: { type: 'default' },
};
const DEFAULT_EVENT_OPTIONS: DefaultEventOptions = {
    summary: 'Lesson',
    location: 'Moscow, Russia',
    description: 'Generated and updating by @t_schedule_bot',

    colorId: '1',
    start: {
        dateTime: new Date().toISOString(),
        timeZone: 'Europe/Moscow',
    },
    end: {
        dateTime: new Date().toISOString(),
        timeZone: 'Europe/Moscow',
    },
};
const DEFAULT_CALENDAR_OPTIONS: DefaultCalendarOptions = {
    summary: 'New Schedule',
    timeZone: 'Europe/Moscow',
    description: 'Сгенерировано и обновляется @t_schedule_bot',
};

// Авторизация на Google Calendar
const auth = new GCalendar.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
    keyFilename: process.env.CREDENTIALS_PATH ?? 'credentials.json',
});
const calendar = GCalendar.calendar({ version: 'v3', auth });

/**
 * Создает календарь и открывает к нему доступ
 */
export async function createCalendar(params?: DefaultCalendarOptions): Promise<string> {
    // Добираем параметры по умолчанию
    params = { ...DEFAULT_CALENDAR_OPTIONS, ...params };

    // Создаем календарь
    const calendarRes = await calendar.calendars.insert({ requestBody: params });
    const calendarId = calendarRes.data.id;

    if (!calendarId) throw new Error('Calendar ID not found');

    // Открываем доступ к календарю
    const ruleId = await createRule(calendarId).catch((err) => {
        console.error('Ошибка открытия календаря: ', err);
        return undefined;
    });

    if (!ruleId) {
        await deleteCalendar(calendarId).catch((err) => console.error('Ошибка удаления календаря: ', err));
        throw new Error('Unable to create calendar due to Acl error');
    }

    return calendarId;
}

/**
 * Удаляет календарь
 */
export async function deleteCalendar(calendarId: string): Promise<void> {
    await calendar.calendars.delete({ calendarId });
}

// Правила
/**
 * Make calendar public
 * @param calendarId - ID of the calendar
 */
export async function createRule(calendarId: string): Promise<string>;
/**
 * Make calendar accessible only for the specified user
 * @param calendarId - ID of the calendar
 * @param email - Email address of the user
 */
export async function createRule(calendarId: string, email: string): Promise<string>;
/**
 * Create a rule by the specified options
 * @param calendarId - ID of the calendar
 * @param params - Parameters
 */
export async function createRule(calendarId: string, params: DefaultRuleOptions): Promise<string>;

/**
 * Создает правило доступа к календарю
 * @param calendarId - ID календаря
 * @param arg - Параметры правила или email адрес пользователя
 * @returns - ID созданного правила
 */
export async function createRule(calendarId: string, arg?: string | DefaultRuleOptions): Promise<string> {
    let params: DefaultRuleOptions = {};

    if (typeof arg === 'string') {
        params = {
            role: 'writer',
            scope: { type: 'user', value: arg },
        };
    } else if (typeof arg === 'object' && arg.role) {
        params = arg;
    }

    // Добираем параметры по умолчанию
    params = { ...DEFAULT_RULE_OPTIONS, ...params };

    // Создаем правило доступа к календарю
    const aclRes = await calendar.acl.insert({
        calendarId,
        requestBody: params,
        sendNotifications: false,
    });
    const ruleId = aclRes.data.id;

    if (!ruleId) throw new Error('Не получилось создать правило');
    return ruleId;
}

/**
 * Удаляет правило доступа к календарю
 * @param calendarId - ID календаря
 * @param start - Дата начала
 * @param end - Дата окончания
 * @returns - Список событий
 */
export async function listEvent(
    calendarId: string,
    start?: Date,
    end?: Date
): Promise<GCalendar.calendar_v3.Schema$Event[]> {
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

/**
 * Создает событие в календаре
 * @param calendarId - ID календаря
 * @param params - Параметры события
 * @returns - ID созданного события
 */
export async function createEvent(calendarId: string, params?: DefaultEventOptions): Promise<string> {
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

    if (!eventId) throw new Error('Event ID not found');

    return eventId;
}

/**
 * Обновляет событие в календаре
 * @param calendarId - ID календаря
 * @param params - Параметры события
 * @returns - Обновленное событие
 */
export async function updateEvent(
    calendarId: string,
    params?: DefaultEventOptions
): GCalendar.GaxiosPromise<GCalendar.calendar_v3.Schema$Event> {
    // Добираем параметры по умолчанию
    params = { ...DEFAULT_EVENT_OPTIONS, ...params };

    const eventId = params.id;

    if (!eventId) throw new Error('Event ID not found');
    delete params.id;
    delete params.etag;
    // Изменяем событие
    return await calendar.events.update({
        calendarId,
        eventId,
        requestBody: params,
    });
}

/**
 * Удаляет событие из календаря
 * @param calendarId - ID календаря
 * @param eventId - ID события
 */
export async function deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await calendar.events.delete({ calendarId, eventId });
}

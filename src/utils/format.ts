import { createHash } from "crypto";
import nearestColor from "./colorize";
import {
  LessonsTypesResponse,
  RaspListResponse,
  RaspResponse,
} from "./wrapper";
import { Student, studentList } from "../utils/database";
import { calendar_v3 } from "@googleapis/calendar";

type StudentFormat = {
  fullName: string;
  department: string;
};
export function formatStudent(id: number): StudentFormat | undefined;
export function formatStudent(student: Student): StudentFormat;
export function formatStudent(
  arg: number | Student
): StudentFormat | undefined {
  let student: Student | undefined;
  if (typeof arg === "number")
    student = studentList.find(({ id }) => id == arg);
  else student = arg;
  if (!student) return undefined;

  return {
    fullName: student.fullName,
    department:
      student.course +
      " курс " +
      (student.spaceID == 1 ? "(Школа Икс)" : "(Т-университет)"),
  };
}

export type ScheduleFormat = {
  id?: string;
  raspId: string;
  etag: string;

  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };

  summary: string;
  colorId: string;
  location: string;
  description: string;
};
const REGEX_URL =
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
const REGEX_ABBR = /(^.{2,}?)[aeiouаеёиоуыэюя]/;
export function formatSchedule(
  raspItem: RaspListResponse["data"]["raspList"],
  lessonsTypes?: LessonsTypesResponse["data"]["lessonsTypes"]
): ScheduleFormat[] {
  return raspItem.map((item) => {
    const startDateTime = new Date(item.start).toISOString();
    const endDateTime = new Date(item.end).toISOString();
    const timeZone = "Europe/Moscow";

    let summary = item.name.trim();
    // Добавляем тип занятия к названию
    if (item.info.type) {
      // Ищем тип занятия по названию
      const lessonType = lessonsTypes?.find(
        (type) => type.label === item.info.type
      );
      // Получаем аббревиатуру типа занятия
      let typeAbbr =
        lessonType?.abbreviation ??
        item.info.type.match(REGEX_ABBR)?.[1] ??
        item.info.type;
      // Делаем первую букву заглавной
      typeAbbr = typeAbbr[0].toUpperCase() + typeAbbr.slice(1);

      // Если аббревиатура найдена и она не совпадает с началом названия, добавляем ее
      if (
        typeAbbr &&
        !(
          summary.split(" ")[0].toLowerCase().replace(/\./g, "") ===
          typeAbbr.toLowerCase().replace(/\./g, "")
        )
      ) {
        summary = typeAbbr + " " + summary;
      }
    }
    // Если это контрольное мероприятие, добавляем метку
    if (item.info.isControlEvent) summary = "📝 " + summary;

    const colorId = nearestColor(item.color).toString();
    const location = item.info.aud ?? "";

    const descriptionList = [];
    if (item.info.moduleName) {
      descriptionList.push(item.info.moduleName);
    }
    if (item.info.theme) {
      descriptionList.push(item.info.theme + "\n");
    }
    if (item.info.groupName) {
      descriptionList.push(`Группа: ${item.info.groupName}`);
    }
    if (item.info.link && REGEX_URL.test(item.info.link)) {
      const linkList = item.info.link.match(REGEX_URL);
      descriptionList.push(`Ссылки: ${linkList?.join(", ")}`);
    }
    if (item.info.teachers.length > 0) {
      const teacherLabel =
        item.info.teachers.length === 1 ? "Преподаватель" : "Преподаватели";
      descriptionList.push(
        `${teacherLabel}: ${item.info.teachers
          .map((t) => `${t.fullName}` + (t.email ? ` (${t.email})` : ""))
          .join(", ")}`
      );
    }
    const description = descriptionList.join("\n").trim();

    return {
      raspId: hash([startDateTime, endDateTime, summary].join("-")),
      etag: hash([summary, location, description].join("-")),

      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },

      summary,
      colorId,
      location,
      description,
    };
  });
}
export function formatRasp(
  rasp: RaspResponse["data"]["rasp"]
): ScheduleFormat[] {
  return rasp.map((item) => {
    const startDateTime = new Date(item.датаНачала + "+03:00").toISOString();
    const endDateTime = new Date(item.датаОкончания + "+03:00").toISOString();
    const timeZone = "Europe/Moscow";

    let summary = item.дисциплина.trim();

    const colorId = "11";
    const location = item.аудитория;

    const descriptionList = [];
    if (item.тема) {
      descriptionList.push(item.тема + "\n");
    }
    if (item.группа) {
      descriptionList.push(`Группа: ${item.группа}`);
    }
    if (item.ссылка && REGEX_URL.test(item.ссылка)) {
      const linkList = item.ссылка.match(REGEX_URL);
      descriptionList.push(`Ссылки: ${linkList?.join(", ")}`);
    }
    if (item.преподаватель) {
      const teacherLabel =
        item.преподаватель.split(",").length === 1
          ? "Преподаватель"
          : "Преподаватели";
      descriptionList.push(`${teacherLabel}: ${item.преподаватель}`);
    }
    descriptionList.push(
      "\nЭто расписание резервного копирования на время возникновения трудностей с доступом к edu.donsu.ru. Пожалуйста, проверьте актуальное расписание на сайте университета. Извините за предоставленные неудобства."
    );
    const description = descriptionList.join("\n").trim();

    return {
      raspId: hash([startDateTime, endDateTime, summary].join("-")),
      etag: hash([summary, location, description].join("-")),

      start: {
        dateTime: startDateTime,
        timeZone: timeZone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timeZone,
      },

      summary,
      colorId,
      location,
      description,
    };
  });
}

export function formatEvent(
  event: calendar_v3.Schema$Event
): ScheduleFormat & { id: string } {
  const startDateTime =
    event.start?.dateTime && new Date(event.start.dateTime).toISOString();
  const endDateTime =
    event.end?.dateTime && new Date(event.end.dateTime).toISOString();

  return {
    id: event.id as string,
    raspId: hash([startDateTime, endDateTime, event.summary].join("-")),
    etag: hash([event.summary, event.location, event.description].join("-")),

    start: {
      dateTime: event.start?.dateTime as string,
      timeZone: event.start?.timeZone as string,
    },
    end: {
      dateTime: event.end?.dateTime as string,
      timeZone: event.end?.timeZone as string,
    },

    summary: event.summary as string,
    colorId: event.colorId as string,
    location: event.location as string,
    description: event.description as string,
  };
}

/**
 * Вычисляет хэш строки
 */
function hash(data: string) {
  return createHash("sha256").update(data).digest("hex");
}

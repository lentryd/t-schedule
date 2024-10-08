import fetch from "node-fetch";
import { createHash } from "crypto";
import { ProviderData, Student, providersCollection } from "./database";
import { ScheduleFormat, formatRasp, formatSchedule } from "./format";

const ORIGIN = "https://edu.donstu.ru/";
const RASP_URL = ORIGIN + "api/RaspManager";
const TOKEN_URL = ORIGIN + "api/tokenauth";
const STUDENT_URL = ORIGIN + "api/GroupManager/GetAllStudentSchoolX";

export type TokenAuthResponse = {
  data: {
    state: number;
    msg: any;
    data: {
      userName: string;
      requertAt: string;
      accessToken: string;
      refreshToken: string;
      uid_1c: string;
      id: number;
    };
    accessToken: string;
    requertAt: number;
    expiresIn: number;
  };
  state: number;
  msg: string;
};
export type UserInfoResponse = {
  data: {
    studentID: number;
    fullName: string;
    showZachBook: boolean;
    domintoryNumber: string;
    numberRoom: any;
    fullNameT: string;
    name: string;
    middleName: string;
    numRecordBook: string;
    numberMobile: string;
    surname: string;
    birthday: string;
    nationality: string;
    group: {
      item1: string;
      item2: number;
    };
    email: string;
    login: string;
    emailForTeams: any;
    admissionYear: string;
    lastEnterDate: string;
    course: string;
    faculty: string;
    plan: {
      item1: string;
      item2: number;
      item3: boolean;
    };
    trainingDirection: string;
    photoLink: string;
    verPhoto: {
      id: number;
      userID: number;
      verificationUserID: any;
      photo: string;
      date: string;
      isChecked: any;
      fio: any;
      faculty: any;
      course: any;
      groupName: any;
    };
    activeSwapPhotoAndVerification: boolean;
    scientificDirector: any;
    showButtonChoiceDis: boolean;
    allowChangePass: boolean;
    showRaspButton: boolean;
    linkRaspButton: any;
    showGraphButton: boolean;
    showVedButton: boolean;
    showResultButton: boolean;
    isLocked: boolean;
    isLockedVed: boolean;
    libraryСard: any;
    online: boolean;
    hideLinks: boolean;
    message: string;
    htmlBlock: string;
    activeSwapPhoto: boolean;
    byPassSheets: Array<any>;
    status: number;
    ratingActivation: boolean;
    linkPsychology: string;
    portfolioIncluded: boolean;
    debtsGraphIncluded: boolean;
    needDormitory: boolean;
    vkID: any;
    googleID: string;
    yandexID: any;
    allowChangePassStudent: boolean;
    hidePlan: boolean;
    hideMoveStory: boolean;
    eliteEducationID: number;
    scopusID: any;
    kaf: {
      kafID: number;
      kafName: string;
      aud: string;
      phone: string;
    };
    facul: {
      faculID: number;
      faculName: string;
      aud: string;
      phone: string;
    };
  };
  state: number;
  msg: string;
};
export type StudentListResponse = {
  data: {
    allStudent: Array<{
      studentID: number;
      fullName: string;
      fio: string;
      photo?: string;
      groups: string;
      course: number;
      year: number;
      courseYear: number;
    }>;
    courses: Array<number>;
  };
  state: number;
  msg: string;
};
export type RaspListResponse = {
  data: {
    benchmark: Array<{
      text: string;
      date: string;
      time: number;
    }>;
    raspList: Array<{
      name: string;
      color: string;
      bordered: boolean;
      start: string;
      end: string | null;
      timeStart: any;
      timeEnd: any;
      info: {
        moduleName?: string;
        categoryID?: number;
        moduleID: number;
        moduleDisID?: number;
        theme?: string;
        aud?: string;
        link?: string;
        teacher: any;
        teacherName: any;
        teacherFullName: any;
        teacherEmail: any;
        teacherNumberMobile: any;
        photoPath: any;
        teacherID: any;
        replacedTeacherID: any;
        userID: any;
        raspItemID: number;
        timeZanID: number;
        teachersNames?: string;
        groupName?: string;
        groups?: Array<{
          name: string;
          groupID: number;
          raspItemID: any;
        }>;
        teachers?: Array<{
          fullName: string;
          name: string;
          email: string;
          number: any;
          userID: number;
          teacherID: number;
          raspItemID: any;
        }>;
        groupID: number;
        typeID?: number;
        educationSpaceID?: number;
        authorModuleID?: number;
        coauthorsIDs?: Array<any>;
        studentsCount: number;
        course: number;
        type?: string;
        courses: Array<number>;
        journalFilled: boolean;
        isReplace: boolean;
        isControlEvent: boolean;
        dateChange?: string;
        showJournal: boolean;
      };
      groupsIDs?: Array<number>;
      teachersIDs?: Array<number>;
      raspItemsIDs?: Array<number>;
      hide: boolean;
      isClassicItem: boolean;
    }>;
    allowEdit: boolean;
    showExportButton: boolean;
    isRaspDisp: boolean;
    userCategories: Array<any>;
  };
  state: number;
  msg: string;
};
export type RaspResponse = {
  data: {
    isCyclicalSchedule: boolean;
    rasp: Array<{
      код: number;
      дата: string;
      датаНачала: string;
      датаОкончания: string;
      перерыв?: number;
      начало: string;
      конец: string;
      деньНедели: number;
      день_недели: string;
      почта: string;
      день: string;
      код_Семестра: number;
      типНедели: number;
      номерПодгруппы: number;
      дисциплина: string;
      преподаватель: string;
      должность: string;
      аудитория: string;
      учебныйГод: string;
      группа: string;
      custom1: string;
      часы: string;
      неделяНачала: any;
      неделяОкончания: any;
      замена?: boolean;
      кодПреподавателя?: number;
      кодГруппы: number;
      фиоПреподавателя?: string;
      кодПользователя?: number;
      элементЦиклРасписания: boolean;
      тема: string;
      номерЗанятия: number;
      ссылка?: string;
      созданиеВебинара: boolean;
      кодВебинара: any;
      вебинарЗапущен: boolean;
      показатьЖурнал: boolean;
      кодыСтрок: Array<number>;
    }>;
    info: {
      group: {
        name: string;
        groupID: number;
      };
      prepod: {
        name: string;
      };
      kafedra: {
        name: string;
      };
      aud: {
        name: string;
      };
      year: string;
      curWeekNumber: number;
      curNumNed: number;
      selectedNumNed: number;
      curSem: number;
      typesWeek: Array<{
        typeWeekID: number;
        name: string;
        shortName: string;
      }>;
      fixedInCache: boolean;
      date: string;
      lastDate: string;
      dateUploadingRasp: string;
    };
  };
  state: number;
  msg: string;
};
export type LessonsTypesResponse = {
  data: {
    lessonsTypes: Array<{
      id: number;
      label: string;
      abbreviation?: string;
      showAll: boolean;
      nonContact: boolean;
      payment: any;
      typeWorkID?: number;
    }>;
  };
  state: number;
  msg: string;
};

export default class Wrapper {
  /**
   * Попытка авторизации
   * @param userName - Логин/Почта пользователя
   * @param password - Пароль пользователя
   * @returns В случае успешного авторизации возвращает токен авторизации, среду пользователя и id студента, иначе `undefined`
   */
  static async tryAuth(userName: string, password: string) {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
        "Current-Path": "https://edu.donstu.ru/WebApp/#/login",
        Referer: "https://edu.donstu.ru/WebApp/",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ userName, password }),
    })
      .then((res) => res.json() as Promise<TokenAuthResponse>)
      .then(({ data }) => ({
        accessToken: data.data.accessToken,
        studentId: data.data.id * -1,
      }))
      .catch((err) => console.log(err));
    if (!response) return;
    const { accessToken, studentId } = response;

    const spaceId = await fetch(
      ORIGIN + "api/UserInfo/Student?studentID=" + studentId,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then((res) => res.json() as Promise<UserInfoResponse>)
      .then(({ data }) => data.eliteEducationID)
      .catch((err) => console.log(err));
    if (!spaceId) return;

    return { accessToken, spaceId, studentId };
  }

  /**
   * Получить расписание студента на месяц (резервный метод)
   * @param studentId - Идентификатор студента
   */
  static async getReserveRasp(studentId: number) {
    const startDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
    );
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(0);

    const endpoint = ORIGIN + "api/Rasp" + `?idStudent=${studentId}`;
    return fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
        "Current-Path": "https://edu.donstu.ru/WebApp/#/Rasp/Group/",
        Referer: "https://edu.donstu.ru/WebApp/",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    })
      .then((res) => res.json() as Promise<RaspResponse>)
      .then(({ data }) => formatRasp(data.rasp))
      .then((rasp) =>
        rasp.filter(
          (i) =>
            new Date(i.start.dateTime).getTime() >= startDate.getTime() &&
            new Date(i.start.dateTime).getTime() <= endDate.getTime()
        )
      );
  }

  /**
   * Получить хэш расписания студента
   * @param studentId - Идентификатор студента
   * @returns Хэш расписания студента
   */
  static async getRaspHash(studentId: number): Promise<string> {
    const shasum = createHash("sha1");
    const endpoint = ORIGIN + "api/Rasp" + `?idStudent=${studentId}&iCal=true`;

    return fetch(endpoint, {
      headers: {
        Accept: "application/json",
        Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
        "Current-Path": "https://edu.donstu.ru/WebApp/#/Rasp/Group/",
        Referer: "https://edu.donstu.ru/WebApp/",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    }).then((res) => {
      return new Promise((resolve, reject) =>
        res.body
          .on("data", (chunk) => shasum.update(chunk))
          .on("error", (err) => reject(err))
          .on("end", () => resolve(shasum.digest("hex")))
      );
    });
  }

  /**
   * Получить расписание студента на месяц
   * @param spaceID - Траектория обучения
   * @param studentId - Идентификатор студента
   * @returns Массив расписания студента
   */
  async getRaspList(
    spaceID: number,
    studentId: number
  ): Promise<ScheduleFormat[]> {
    if (!(await this.checkSession())) await this.Auth();
    const lessonsTypes = await this.getLessonsTypes();

    const startDate = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" })
    );
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 2);
    endDate.setHours(23, 59, 59, 999);
    endDate.setDate(0);

    const endpoint =
      RASP_URL +
      `?showAll=true` +
      `&studentsIDs=${studentId}` +
      `&educationSpaceID=${spaceID}` +
      `&showJournalFilled=false`;

    return await Promise.all([
      fetch(endpoint + `&month=${startDate.getMonth() + 1}`, {
        headers: {
          Authorization: "Bearer " + this.accessToken,
          Cookie: "authToken=" + this.accessToken,
          Accept: "application/json",
          Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
          "Current-Path": "https://edu.donstu.ru/WebApp/#/RaspManager/Calendar",
          Referer: "https://edu.donstu.ru/WebApp/",
          "Cache-Control": "no-cache",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      })
        .then((res) => res.json() as Promise<RaspListResponse>)
        .then((data) =>
          formatSchedule(data.data.raspList, lessonsTypes.data.lessonsTypes)
        ),
      fetch(endpoint + `&month=${endDate.getMonth() + 1}`, {
        headers: {
          Authorization: "Bearer " + this.accessToken,
          Cookie: "authToken=" + this.accessToken,
          Accept: "application/json",
          Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
          "Current-Path": "https://edu.donstu.ru/WebApp/#/RaspManager/Calendar",
          Referer: "https://edu.donstu.ru/WebApp/",
          "Cache-Control": "no-cache",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      })
        .then((res) => res.json() as Promise<RaspListResponse>)
        .then((data) =>
          formatSchedule(data.data.raspList, lessonsTypes.data.lessonsTypes)
        ),
    ]).then((arr) =>
      [...arr[0], ...arr[1]].filter(
        (i) =>
          new Date(i.start.dateTime).getTime() >= startDate.getTime() &&
          new Date(i.start.dateTime).getTime() <= endDate.getTime()
      )
    );
  }

  /**
   * Получить типы занятий для учебного пространства
   */
  async getLessonsTypes(): Promise<LessonsTypesResponse> {
    if (!(await this.checkSession())) await this.Auth();

    const endpoint =
      ORIGIN +
      "api/SuggestedModules/LessonsTypes" +
      `?educationSpaceID=${this.spaceId}`;

    return await fetch(endpoint, {
      headers: {
        Authorization: "Bearer " + this.accessToken,
        Cookie: "authToken=" + this.accessToken,
        Accept: "application/json",
        Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
        "Current-Path": "https://edu.donstu.ru/WebApp/#/RaspManager/Calendar",
        Referer: "https://edu.donstu.ru/WebApp/",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    }).then((res) => res.json() as Promise<LessonsTypesResponse>);
  }

  private spaceId: number;
  private providerId: string | undefined;
  private credentials: { userName: string; password: string };
  private accessToken: string | undefined;

  constructor(provider: ProviderData, providerId?: string) {
    this.spaceId = provider.educationSpaceId;
    this.providerId = providerId;
    this.credentials = {
      userName: provider.userName,
      password: provider.password,
    };
    this.accessToken = provider.accessToken;
  }

  /**
   * Авторизация пользователя
   */
  async Auth() {
    const { userName, password } = this.credentials;
    console.log("Authenticating user: " + userName);
    const tokenAuth = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        isParent: false,
        recaptchaToken: null,
        userName,
        password,
      }),
    })
      .then((res) => res.json() as Promise<TokenAuthResponse>)
      .catch((err) => console.log(err));
    if (!tokenAuth) throw new Error("Can't get token for user: " + userName);

    this.accessToken = tokenAuth.data.accessToken;
    this.providerId &&
      providersCollection
        .doc(this.providerId)
        .update({ accessToken: this.accessToken });
  }

  /**
   * Проверка сессии пользователя
   */
  async checkSession() {
    return await fetch(TOKEN_URL, {
      headers: {
        Authorization: "Bearer " + this.accessToken,
        Cookie: "authToken=" + this.accessToken,
        Accept: "application/json",
        Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
        "Current-Path": "https://edu.donstu.ru/WebApp/#/RaspManager/Calendar",
        Referer: "https://edu.donstu.ru/WebApp/",
        "Cache-Control": "no-cache",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      },
    })
      .then((res) => res.json())
      .then(({ state }) => state === 1)
      .catch((err) => (console.error(err), false));
  }

  /**
   * Получаем список студентов
   */
  async getStudentList(): Promise<Student[]> {
    if (!(await this.checkSession())) await this.Auth();

    const studentList = await fetch(
      STUDENT_URL + "?educationSpaceID=" + this.spaceId,
      {
        headers: {
          Authorization: "Bearer " + this.accessToken,
          Cookie: "authToken=" + this.accessToken,
          Accept: "application/json",
          Fp: "hs%40SHzqNbc_N9O1_a730jgPIaCMnKrW5K6YyiaTh-PbJ24VPvjM%3FObXBb38EnDC1FJCC5DeAoU1UFGVmx%247reZqyiXVwiO%40%40NqEt1SasELZ9rC%40VgVWqMaWviTjhxzgYZ5HeBs0emOmS-xHfb-OM7V",
          "Current-Path": "https://edu.donstu.ru/WebApp/#/RaspManager/Calendar",
          Referer: "https://edu.donstu.ru/WebApp/",
          "Cache-Control": "no-cache",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        },
      }
    )
      .then((res) => res.json() as Promise<StudentListResponse>)
      .catch((err) => console.error(err));

    return !studentList
      ? []
      : studentList.data.allStudent
          .map((student) => ({
            id: student.studentID,
            course: student.course,
            spaceID: this.spaceId,
            fullName: student.fullName,
            shortName: student.fio,
          }))
          .filter(({ spaceID }) => spaceID > 0);
  }
}

import {
  Firestore,
  CollectionReference,
  Timestamp,
} from "@google-cloud/firestore";

const db = new Firestore({ keyFilename: "credentials.json" });

// Коллекция с системными дан
export const sysCollection = db.collection("sys");

// Коллекция для хранения данных пользователей
export interface UserData {
  studentId?: number;
  calendarId?: string;
  educationSpaceId?: number;
  raspHash?: string;
  lastScheduleUpdate: Timestamp;
  hasEnteredEmail: boolean;
}
export const usersCollection = db.collection(
  "users"
) as CollectionReference<UserData>;

// Коллекция для хранения данных сессий
export interface SessionData {
  state: string;
  recentMessageIds: number[];
  commandMessageIds: number[];
}
export const sessionsCollection = db.collection(
  "sessions"
) as CollectionReference<SessionData>;

// Коллекция для хранения данных провайдеров
export interface ProviderData {
  userId: number;
  educationSpaceId: number;

  userName: string;
  password: string;
  accessToken?: string;
}
export const providersCollection = db.collection(
  "providers"
) as CollectionReference<ProviderData>;

// Получаем список студентов
export interface Student {
  id: number;
  course: number;
  spaceID: number;
  fullName: string;
  shortName: string;
}
export let studentList: Student[] = [];
export let studentListLastUpdatedTimestamp: number = 0;
sysCollection.doc("studentList").onSnapshot((snapshot) => {
  const data = snapshot.data();
  studentList = data?.list ?? [];
  studentListLastUpdatedTimestamp = data?.timestamp.seconds * 1000 ?? 0;
});

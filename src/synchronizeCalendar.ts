import { Timestamp, Filter } from "@google-cloud/firestore";
import Wrapper from "./utils/wrapper";
import {
  Student,
  UserData,
  ProviderData,
  sysCollection,
  usersCollection,
  providersCollection,
  studentListLastUpdatedTimestamp,
} from "./utils/database";
import {
  listEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "./utils/calendar";
import { ScheduleFormat, formatEvent } from "./utils/format";

// Define constants
const MS_IN_DAY = 1000 * 60 * 60 * 24;
const USER_UPDATE_TIME = 1000 * 60 * 10;
// Define types
type User = UserData & { id: string };

export default async function synchronizeCalendar() {
  // Retrieve users that need schedule updates
  const usersToUpdate = await getUsersToUpdate();

  // Process each user in parallel
  await Promise.all(
    usersToUpdate.map(async (user) => {
      try {
        await processUser(user);
      } catch (error) {
        console.error(`Error processing user (${user.id}):`, error);
      }
    })
  );
}

async function getUsersToUpdate(): Promise<User[]> {
  // Get users with outdated schedules or no schedules
  const timestampThreshold = getTimestampThreshold();
  const timestampFilter = Filter.or(
    Filter.where("lastScheduleUpdate", "==", null),
    Filter.where("lastScheduleUpdate", "<", timestampThreshold)
  );

  return (await usersCollection.where(timestampFilter).get()).docs.map(
    (doc) => ({ id: doc.id, ...doc.data() })
  );
}

async function processUser(user: User) {
  const { calendarId, educationSpaceId, studentId } = user;
  if (!calendarId || !educationSpaceId || !studentId) return;

  const raspList = await Wrapper.getRaspList(educationSpaceId, studentId);
  const eventList = (await listEvent(calendarId)).map(formatEvent);

  const eventsToUpdate: ScheduleFormat[] = [];
  const eventsToCreate: ScheduleFormat[] = [];
  const eventsToDelete: string[] = [];

  // Find events that need to be updated or created
  raspList.forEach((item) => {
    const event = eventList.find((e) => e.id === item.id);
    if (!event) {
      eventsToCreate.push(item);
    } else if (item.etag !== event.etag) {
      eventsToUpdate.push(item);
    }
  });

  // Find events that need to be deleted
  eventList.forEach((event) => {
    if (!raspList.find((item) => event.id === item.id)) {
      eventsToDelete.push(event.id);
    }
  });

  // Perform updates, creations, and deletions in parallel
  await Promise.all([
    Promise.all(eventsToUpdate.map((event) => updateEvent(calendarId, event))),
    Promise.all(eventsToCreate.map((event) => createEvent(calendarId, event))),
    Promise.all(eventsToDelete.map((id) => deleteEvent(calendarId, id))),
  ]);

  // Update the user's last schedule update timestamp
  user.lastScheduleUpdate = Timestamp.now();
  await usersCollection.doc(user.id).set(user);
}

function getTimestampThreshold() {
  const now = Date.now();
  const date = new Date(
    new Date().toLocaleString("en", { timeZone: "Europe/Moscow" })
  );

  if (date.getHours() >= 7 && date.getHours() <= 18 && date.getDay() > 0) {
    return Timestamp.fromMillis(now - USER_UPDATE_TIME);
  } else {
    return Timestamp.fromMillis(now - MS_IN_DAY);
  }
}

export async function updateStudentList(ignoreTime = false) {
  // Check if the update should be ignored based on the time
  if (!ignoreTime && shouldIgnoreUpdate()) {
    return;
  }

  // Fetch providers for SchoolX and TUniversity
  const providers = (await providersCollection.get()).docs.map((doc) =>
    doc.data()
  );
  const schoolXProviders = providers.filter(
    ({ educationSpaceId }) => educationSpaceId === 1
  );
  const tUniversityProviders = providers.filter(
    ({ educationSpaceId }) => educationSpaceId === 4
  );

  // Create an array to collect students
  const students: Student[] = [];

  // Fetch students for SchoolX
  await fetchAndAddStudents(schoolXProviders, students);

  // Fetch students for TUniversity
  await fetchAndAddStudents(tUniversityProviders, students);

  // Save the list of students with a timestamp
  await sysCollection.doc("studentList").set({
    list: students,
    timestamp: Timestamp.now(),
  });
}

async function fetchAndAddStudents(
  providers: ProviderData[],
  students: Student[]
) {
  while (providers.length > 0) {
    const randomIndex = randomInt(providers.length - 1);
    const provider = providers.splice(randomIndex, 1)[0];
    const studentsFromProvider = await new Wrapper(provider).getStudentList();

    if (studentsFromProvider.length > 0) {
      students.push(...studentsFromProvider);
      break;
    }
  }
}

function shouldIgnoreUpdate() {
  const lastUpdatedTimestamp = studentListLastUpdatedTimestamp || 0;
  const currentTime = Date.now();
  const oneDayInMillis = 1000 * 60 * 60 * 24;

  return currentTime - lastUpdatedTimestamp < oneDayInMillis;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

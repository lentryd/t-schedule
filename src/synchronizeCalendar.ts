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
const MS_IN_HOUR = 1000 * 60 * 60;
const USER_UPDATE_TIME = 1000 * 60 * 10;
// Define types
type User = UserData & { id: string };

export let isProgress = false;

export default async function synchronizeCalendar() {
  isProgress = true;
  // Retrieve users that need schedule updates
  const usersToUpdate = await getUsersToUpdate();

  for (const user of usersToUpdate) {
    try {
      await processUser(user);
    } catch (error) {
      console.error(`User (${user.id}): Error processing user:`, error);
    }
  }

  console.log("Synchronization completed");
  isProgress = false;
}

async function getUsersToUpdate(): Promise<User[]> {
  // Get users with outdated schedules or no schedules
  const timestampThreshold = getTimestampThreshold();
  const timestampFilter = Filter.or(
    Filter.where("lastScheduleUpdate", "==", null),
    Filter.where("lastScheduleUpdate", "<", timestampThreshold)
  );

  console.log("Fetching users to update...");
  const usersSnapshot = await usersCollection.where(timestampFilter).get();
  console.log("Users fetched successfully.");

  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function processUser(user: User) {
  const { calendarId, educationSpaceId, studentId, raspHash } = user;
  if (!calendarId || !educationSpaceId || !studentId) return;
  const logPrefix = `User (${user.id})`;
  const currentRaspHash = await Wrapper.getRaspHash(studentId);

  console.log(`${logPrefix}: Processing for schedule updates....`);

  // If the schedule is up to date, return
  if (raspHash == currentRaspHash) {
    user.lastScheduleUpdate = Timestamp.now();
    await usersCollection
      .doc(user.id)
      .update({ lastScheduleUpdate: user.lastScheduleUpdate });
    console.log(`${logPrefix}: Schedule is up to date.`);
    return;
  }

  const providers = (
    await providersCollection
      .where("educationSpaceId", "==", user.educationSpaceId)
      .get()
  ).docs.map((doc) => [doc.id, doc.data()] as [string, ProviderData]);
  const randomIndex = randomInt(providers.length - 1);
  const provider = providers.splice(randomIndex, 1)[0];

  const raspList = await new Wrapper(provider[1], provider[0])
    .getRaspList(educationSpaceId, studentId)
    .catch((error) => {
      console.error(`${logPrefix}: Error fetching rasp list:`, error);
      console.info(`${logPrefix}: Trying to fetch the reserve...`);
      return Wrapper.getReserveRasp(studentId);
    });
  const eventList = (await listEvent(calendarId)).map(formatEvent);

  const eventsToUpdate: ScheduleFormat[] = [];
  const eventsToCreate: ScheduleFormat[] = [];
  const eventsToDelete: string[] = [];

  // Find events that need to be updated or created
  raspList.forEach((item) => {
    const event = eventList.find((e) => e.raspId === item.raspId);
    if (!event) {
      eventsToCreate.push(item);
    } else if (item.etag !== event.etag) {
      item.id = event.id;
      item.colorId = event.colorId;
      eventsToUpdate.push(item);
    }
  });

  // Find events that need to be deleted
  eventList.forEach((event) => {
    if (!raspList.find((item) => event.raspId === item.raspId)) {
      eventsToDelete.push(event.id);
    }
  });

  if (raspList.length == 0) eventsToDelete.length = 0;

  // Perform updates, creations, and deletions
  for (const event of eventsToUpdate) {
    try {
      await updateEvent(calendarId, event);
    } catch (error) {
      console.error(`${logPrefix}: Error updating event:`, event, error);
    }
  }
  for (const event of eventsToCreate) {
    try {
      await createEvent(calendarId, event);
    } catch (error) {
      console.error(`${logPrefix}: Error creating event:`, event, error);
    }
  }
  for (const eventId of eventsToDelete) {
    try {
      await deleteEvent(calendarId, eventId);
    } catch (error) {
      console.error(`${logPrefix}: Error deleting event (${eventId}):`, error);
    }
  }

  // Update the user's last schedule update timestamp
  user.raspHash = currentRaspHash;
  user.lastScheduleUpdate = Timestamp.now();
  await usersCollection.doc(user.id).update({
    raspHash: user.raspHash,
    lastScheduleUpdate: user.lastScheduleUpdate,
  });
  console.log(`${logPrefix}: Schedule updates completed.`);
}

function getTimestampThreshold() {
  const now = Date.now();
  const date = new Date(
    new Date().toLocaleString("en", { timeZone: "Europe/Moscow" })
  );

  if (date.getHours() >= 7 && date.getHours() <= 18 && date.getDay() > 0) {
    return Timestamp.fromMillis(now - USER_UPDATE_TIME);
  } else {
    return Timestamp.fromMillis(now - MS_IN_HOUR / 2);
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

  return currentTime - lastUpdatedTimestamp < MS_IN_DAY;
}

function randomInt(max: number) {
  return Math.floor(Math.random() * (max + 1));
}

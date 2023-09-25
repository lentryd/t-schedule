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

export default async function synchronizeCalendar() {
  // Retrieve users that need schedule updates
  const usersToUpdate = await getUsersToUpdate();

  // Process each user in parallel
  await Promise.all(
    usersToUpdate.map(async (user) => {
      try {
        console.log(`Processing user (${user.id})...`);
        await processUser(user);
        console.log(`User (${user.id}) processed successfully.`);
      } catch (error) {
        console.error(`Error processing user (${user.id}):`, error);
      }
    })
  );

  console.log("Synchronization completed");
}

async function getUsersToUpdate(): Promise<User[]> {
  // Get users with outdated schedules or no schedules
  const timestampThreshold = getTimestampThreshold();
  const timestampFilter = Filter.or(
    Filter.where("lastScheduleUpdate", "!=", null),
    Filter.where("lastScheduleUpdate", "<", timestampThreshold)
  );

  console.log("Fetching users to update...");
  const usersSnapshot = await usersCollection.where(timestampFilter).get();
  console.log("Users fetched successfully.");

  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function processUser(user: User) {
  const { calendarId, educationSpaceId, studentId } = user;
  if (!calendarId || !educationSpaceId || !studentId) return;

  console.log(`Processing user (${user.id}) for schedule updates...`);
  const raspList = await Wrapper.getRaspList(educationSpaceId, studentId);
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
      eventsToUpdate.push(item);
    }
  });

  // Find events that need to be deleted
  eventList.forEach((event) => {
    if (!raspList.find((item) => event.raspId === item.raspId)) {
      eventsToDelete.push(event.id);
    }
  });
  if (eventList.length == eventsToDelete.length) {
    eventsToDelete.length = 0;
    console.log("Try delete 100% of events");
  }

  // Perform updates, creations, and deletions
  for (const event of eventsToUpdate) {
    try {
      console.log(`Updating event for user (${user.id})...`);
      await updateEvent(calendarId, event);
      console.log(`Event updated successfully.`);
    } catch (error) {
      console.error(`Error updating event:`, error);
    }
  }
  for (const event of eventsToCreate) {
    try {
      console.log(`Creating event for user (${user.id})...`);
      await createEvent(calendarId, event);
      console.log(`Event created successfully.`);
    } catch (error) {
      console.error(`Error creating event:`, error);
    }
  }
  for (const eventId of eventsToDelete) {
    try {
      console.log(`Deleting event for user (${user.id})...`);
      await deleteEvent(calendarId, eventId);
      console.log(`Event deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting event:`, error);
    }
  }

  // Update the user's last schedule update timestamp
  user.lastScheduleUpdate = Timestamp.now();
  await usersCollection.doc(user.id).set(user);
  console.log(`User (${user.id}) schedule updates completed.`);
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

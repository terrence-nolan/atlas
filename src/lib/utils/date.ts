/**
 * Default timezone used for date formatting and calendar-day comparisons.
 */
export const SITE_TIME_ZONE = "America/New_York";

/**
 * Parses a date string or Date object into a valid Date object.
 * Returns null for null, empty, or invalid inputs.
 */
function parseDate(date: string | Date | null): Date | null {
  if (!date) return null;

  const parsed = date instanceof Date ? date : new Date(date);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Converts a timestamp into a YYYY-MM-DD calendar date key.
 * Uses the specified timezone to determine the calendar date.
 * Returns an empty string for null or invalid dates.
 */
export function getDateKey(
  date: string | Date | null,
  timeZone = SITE_TIME_ZONE,
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(parsedDate);

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

/**
 * Returns the calendar date immediately preceding a YYYY-MM-DD date string.
 * Uses UTC arithmetic to avoid daylight saving time issues.
 */
function getPreviousCalendarDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const previousDate = new Date(Date.UTC(year, month - 1, day - 1));

  return previousDate.toISOString().slice(0, 10);
}

/**
 * Formats a YYYY-MM-DD calendar date as "Today", "Yesterday",
 * or "Mmm D, YYYY" for older dates.
 * Uses the specified timezone to determine Today and Yesterday.
 * Preserves the original calendar date without timezone shifting.
 * Returns an empty string for null or invalid dates.
 */
export function formatCalendarDate(
  date: string | null,
  timeZone = SITE_TIME_ZONE,
): string {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";

  const [year, month, day] = date.split("-").map(Number);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  // Reject impossible calendar dates, such as February 30.
  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return "";
  }

  const todayDate = getDateKey(new Date(), timeZone);

  if (date === todayDate) return "Today";

  if (date === getPreviousCalendarDate(todayDate)) {
    return "Yesterday";
  }

  // UTC preserves the calendar date rather than shifting it
  // according to the site's timezone.
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(calendarDate);
}

/**
 * Formats a timestamp as "Mmm D, YYYY" in the specified timezone.
 * Returns an empty string for null or invalid dates.
 */
export function formatTimestamp(
  date: string | Date | null,
  timeZone = SITE_TIME_ZONE,
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  }).format(parsedDate);
}

/**
 * Formats a timestamp as "Mmm D, YYYY, H:MM AM/PM TZ"
 * in the specified timezone, including its timezone abbreviation.
 * Returns an empty string for null or invalid dates.
 */
export function formatDateTime(
  date: string | Date | null,
  timeZone = SITE_TIME_ZONE,
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(parsedDate);
}

/**
 * Checks whether a timestamp falls on the current calendar day
 * in the specified timezone.
 * Returns false for null or invalid dates.
 */
export function isToday(
  date: string | Date | null,
  timeZone = SITE_TIME_ZONE,
): boolean {
  if (!date) return false;

  return getDateKey(date, timeZone) === getDateKey(new Date(), timeZone);
}
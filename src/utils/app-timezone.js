/**
 * App business timezone helpers.
 * Booking "today" / "now" must match Pakistan hours (same as dashboard + wallet cron),
 * otherwise past slots can slip through when the server clock is UTC.
 */
const APP_TIMEZONE = 'Asia/Karachi';

function getZonedParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);

  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value])
  );

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10) % 24,
    minute: parseInt(map.minute, 10)
  };
}

/** YYYY-MM-DD in Asia/Karachi */
function getLocalDateString(date = new Date()) {
  const { year, month, day } = getZonedParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Minutes since midnight in Asia/Karachi */
function getNowMinutesInAppTz(date = new Date()) {
  const { hour, minute } = getZonedParts(date);
  return hour * 60 + minute;
}

/** Normalize DATEONLY / Date / "YYYY-MM-DD..." to YYYY-MM-DD */
function normalizeDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return getLocalDateString(new Date(value));
}

/**
 * Parse a TIME / clock string into minutes since midnight.
 * Supports "HH:mm:ss", "HH:mm", "hh:mm:ss A", "hh:mm A", and Date objects.
 */
function minutesFromTimeValue(timeValue) {
  if (timeValue == null) return null;

  if (timeValue instanceof Date && !Number.isNaN(timeValue.getTime())) {
    // Sequelize TIME values sometimes surface as Date; use UTC components
    // so "16:30:00" stored as TIME is not shifted by local/server TZ.
    return timeValue.getUTCHours() * 60 + timeValue.getUTCMinutes();
  }

  const raw = String(timeValue).trim();

  // Full ISO / datetime → extract clock time portion before parsing
  const isoMatch = raw.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (isoMatch) {
    return parseInt(isoMatch[1], 10) * 60 + parseInt(isoMatch[2], 10);
  }

  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[4] ? match[4].toUpperCase() : null;

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * True when booking date+startTime is already in the past (or has started) in Asia/Karachi.
 * Example: slot 2026-08-04 16:30 booked at 17:00 → true (must reject).
 */
function isSlotInPast(date, startTime, now = new Date()) {
  const bookingDate = normalizeDateOnly(date);
  if (!bookingDate) return true;

  const today = getLocalDateString(now);
  if (bookingDate < today) return true;
  if (bookingDate > today) return false;

  const slotMins = minutesFromTimeValue(startTime);
  // Unparseable start times are treated as past so create/cancel fail closed.
  if (slotMins == null) return true;

  return slotMins <= getNowMinutesInAppTz(now);
}

module.exports = {
  APP_TIMEZONE,
  getLocalDateString,
  getNowMinutesInAppTz,
  normalizeDateOnly,
  minutesFromTimeValue,
  isSlotInPast
};

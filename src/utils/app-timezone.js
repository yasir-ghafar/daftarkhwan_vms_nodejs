/**
 * App business timezone helpers.
 * Booking "today" / "now" must match Pakistan hours (same as dashboard + wallet cron),
 * otherwise past slots can slip through when the server clock is UTC.
 */
const APP_TIMEZONE = 'Asia/Karachi';
// Asia/Karachi has no DST — safe fixed offset for wall-clock → instant conversion.
const APP_UTC_OFFSET = '+05:00';

function pad2(n) {
  return String(n).padStart(2, '0');
}

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
  if (typeof value === 'string') {
    // Prefer ISO / YYYY-MM-DD prefix when present
    const isoDate = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDate) return isoDate[1];
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return getLocalDateString(parsed);
    return null;
  }
  return getLocalDateString(new Date(value));
}

/**
 * Parse a TIME / clock string into minutes since midnight.
 * Supports "HH:mm:ss", "HH:mm", "HH:mm:ss.sss", "hh:mm:ss A", "hh:mm A",
 * space-separated datetimes, ISO strings, and Date objects.
 */
function minutesFromTimeValue(timeValue) {
  if (timeValue == null) return null;

  if (timeValue instanceof Date && !Number.isNaN(timeValue.getTime())) {
    // Sequelize TIME values sometimes surface as Date; use UTC components
    // so "16:30:00" stored as TIME is not shifted by local/server TZ.
    return timeValue.getUTCHours() * 60 + timeValue.getUTCMinutes();
  }

  const raw = String(timeValue).trim();

  // ISO-8601 → convert instant to Asia/Karachi wall-clock minutes
  if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    const instant = new Date(raw);
    if (!Number.isNaN(instant.getTime())) {
      return getNowMinutesInAppTz(instant);
    }
  }

  // "YYYY-MM-DD HH:mm[:ss[.sss]]" → take the time portion
  const spaceDateTime = raw.match(
    /^\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(AM|PM)?$/i
  );
  if (spaceDateTime) {
    let hours = parseInt(spaceDateTime[1], 10);
    const minutes = parseInt(spaceDateTime[2], 10);
    const meridiem = spaceDateTime[4] ? spaceDateTime[4].toUpperCase() : null;
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // "HH:mm[:ss[.sss]] [AM|PM]"
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?\s*(AM|PM)?$/i);
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
 * Resolve booking slot to an absolute Date instant.
 * - Client create payloads use ISO UTC: "2026-07-29T10:00:00.000Z" → parse as-is
 * - DB TIME values ("10:00:00") + date → interpret as Asia/Karachi wall clock
 */
function getSlotInstant(date, startTime) {
  if (startTime instanceof Date && !Number.isNaN(startTime.getTime())) {
    // Full datetime Date (not a Sequelize TIME epoch date) — rare on create
    // If years look real, treat as absolute; TIME epoch (~1970) falls through.
    if (startTime.getUTCFullYear() > 1971) {
      return startTime;
    }
  }

  if (typeof startTime === 'string') {
    const raw = startTime.trim();

    // Absolute ISO from client (docs / app send this on create)
    if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
      const instant = new Date(raw);
      if (!Number.isNaN(instant.getTime())) return instant;
    }
  }

  const bookingDate = normalizeDateOnly(date);
  const slotMins = minutesFromTimeValue(startTime);
  if (!bookingDate || slotMins == null) return null;

  const hh = pad2(Math.floor(slotMins / 60));
  const mm = pad2(slotMins % 60);
  // Wall clock in Pakistan business timezone
  return new Date(`${bookingDate}T${hh}:${mm}:00${APP_UTC_OFFSET}`);
}

/**
 * True when the booking slot instant is already in the past (or has started).
 * Uses absolute time for ISO payloads so UTC "T10:00:00.000Z" is not compared
 * as raw "10:00" against Karachi clock (that incorrectly blocked future slots).
 */
function isSlotInPast(date, startTime, now = new Date()) {
  const slotInstant = getSlotInstant(date, startTime);
  // Unparseable slot → fail closed (reject)
  if (!slotInstant || Number.isNaN(slotInstant.getTime())) return true;
  return slotInstant.getTime() <= now.getTime();
}

module.exports = {
  APP_TIMEZONE,
  getLocalDateString,
  getNowMinutesInAppTz,
  normalizeDateOnly,
  minutesFromTimeValue,
  getSlotInstant,
  isSlotInPast
};

const { Op } = require('sequelize');
const {
  Location,
  MeetingRoom,
  Company,
  User,
  Wallet,
  Booking
} = require('../models');
const { Logger } = require('../config');

const DEFAULT_SLOT_MINUTES = 30;
const DEFAULT_LOW_BALANCE_THRESHOLD = 10;
const ACTIVE_STATUSES = ['active', 'Active'];
const CONFIRMED_BOOKING_STATUS = 'confirmed';

const DAY_NAME_TO_ABBREV = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thur',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun'
};

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return getLocalDateString(new Date(value));
}

function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? 6 : day - 1; // Monday start
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function eachDateInclusive(startDate, endDate) {
  const dates = [];
  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function minutesFromTimeValue(timeValue) {
  if (!timeValue) return null;

  if (timeValue instanceof Date) {
    return timeValue.getHours() * 60 + timeValue.getMinutes();
  }

  const raw = String(timeValue).trim();
  // Supports "HH:mm:ss", "HH:mm", "hh:mm:ss A", "hh:mm A"
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

function parseAvailableDays(availableDays) {
  if (!availableDays) return [];

  let value = availableDays;
  try {
    while (typeof value === 'string') {
      value = JSON.parse(value);
    }
  } catch (error) {
    return String(availableDays)
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(value)) return [];
  return value.map(String).map((day) => day.trim()).filter(Boolean);
}

function isRoomAvailableOnDate(room, date) {
  const days = parseAvailableDays(room.availableDays);
  if (days.length === 0) return true; // no restriction configured

  const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const weekdayAbbrev = DAY_NAME_TO_ABBREV[weekdayName.toLowerCase()];

  return days.some((day) => {
    const normalized = day.toLowerCase();
    return (
      normalized === weekdayName.toLowerCase() ||
      normalized === String(weekdayAbbrev).toLowerCase() ||
      // tolerate "Thu" vs "Thur"
      (weekdayAbbrev === 'Thur' && (normalized === 'thu' || normalized === 'thur' || normalized === 'thursday'))
    );
  });
}

/// Capacity minutes from MeetingRoom.openingTime / closingTime
function getRoomCapacityMinutes(room) {
  const openMins = minutesFromTimeValue(room.openingTime);
  const closeMins = minutesFromTimeValue(room.closingTime);
  if (openMins == null || closeMins == null || closeMins <= openMins) {
    return 0;
  }
  return closeMins - openMins;
}

/// Booked minutes from Booking.startTime / endTime (fallback: slots * duration)
function getBookingDurationMinutes(booking, slotMinutes = DEFAULT_SLOT_MINUTES) {
  const startMins = minutesFromTimeValue(booking.startTime);
  const endMins = minutesFromTimeValue(booking.endTime);

  if (startMins != null && endMins != null && endMins > startMins) {
    return endMins - startMins;
  }

  return (Number(booking.slots) || 0) * slotMinutes;
}

function deriveBookingDisplayStatus(booking, now = new Date()) {
  if (booking.status === 'cancelled') {
    return 'Cancelled';
  }

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = minutesFromTimeValue(booking.startTime);
  const endMins = minutesFromTimeValue(booking.endTime);

  if (startMins == null || endMins == null) {
    return booking.status || 'Confirmed';
  }

  if (nowMins >= startMins && nowMins < endMins) {
    return 'Ongoing';
  }
  if (nowMins < startMins) {
    return 'Upcoming';
  }
  return 'Completed';
}

function formatTimeRange(startTime, endTime) {
  const format = (value) => {
    const mins = minutesFromTimeValue(value);
    if (mins == null) return '';

    let hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return `${format(startTime)} - ${format(endTime)}`;
}

function buildOccupancyByLocation(locations, rooms, bookings, date) {
  const capacityByLocation = {};
  const bookedByLocation = {};

  locations.forEach((location) => {
    capacityByLocation[location.id] = 0;
    bookedByLocation[location.id] = 0;
  });

  rooms.forEach((room) => {
    if (!room.LocationId || capacityByLocation[room.LocationId] == null) return;
    if (!isRoomAvailableOnDate(room, date)) return;
    capacityByLocation[room.LocationId] += getRoomCapacityMinutes(room);
  });

  bookings.forEach((booking) => {
    const locationId = booking.Room?.LocationId;
    if (!locationId || bookedByLocation[locationId] == null) return;

    const slotMinutes = Number(booking.Room?.duration) || DEFAULT_SLOT_MINUTES;
    bookedByLocation[locationId] += getBookingDurationMinutes(booking, slotMinutes);
  });

  let totalCapacity = 0;
  let totalBooked = 0;

  const occupancyByLocation = locations.map((location) => {
    const capacity = capacityByLocation[location.id] || 0;
    const booked = bookedByLocation[location.id] || 0;
    totalCapacity += capacity;
    totalBooked += booked;

    const percent = capacity > 0 ? Math.min(100, Math.round((booked / capacity) * 100)) : 0;
    return {
      id: location.id,
      name: location.name,
      percent
    };
  });

  const avgOccupancy = totalCapacity > 0
    ? Math.min(100, Math.round((totalBooked / totalCapacity) * 100))
    : 0;

  return { occupancyByLocation, avgOccupancy, totalCapacity, totalBooked };
}

/// Aggregate stats for dashboard stat cards + occupancy by location
async function getDashboardSummary() {
  try {
    const now = new Date();
    const today = getLocalDateString(now);
    const startOfMonth = getStartOfMonth(now);
    const startOfWeek = getStartOfWeek(now);

    const lastWeekStart = new Date(startOfWeek);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(startOfWeek);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1); // Sunday before current week

    const [
      locationsCount,
      locationsThisMonth,
      meetingRoomsCount,
      activeMeetingRooms,
      companiesCount,
      companiesThisMonth,
      activeUsersCount,
      usersThisWeek,
      bookingsTodayCount,
      activeLocations,
      activeRooms,
      todaysBookings,
      lastWeekBookings
    ] = await Promise.all([
      Location.count({
        where: { status: { [Op.in]: ACTIVE_STATUSES } }
      }),
      Location.count({
        where: {
          status: { [Op.in]: ACTIVE_STATUSES },
          createdAt: { [Op.gte]: startOfMonth }
        }
      }),
      MeetingRoom.count(),
      MeetingRoom.count({
        where: { status: { [Op.in]: ACTIVE_STATUSES } }
      }),
      Company.count(),
      Company.count({
        where: { createdAt: { [Op.gte]: startOfMonth } }
      }),
      User.count({
        where: { status: 'active' }
      }),
      User.count({
        where: {
          status: 'active',
          createdAt: { [Op.gte]: startOfWeek }
        }
      }),
      Booking.count({
        where: {
          date: today,
          status: CONFIRMED_BOOKING_STATUS
        }
      }),
      Location.findAll({
        where: { status: { [Op.in]: ACTIVE_STATUSES } },
        attributes: ['id', 'name', 'status'],
        order: [['name', 'ASC']]
      }),
      // Use MeetingRoom columns: LocationId, openingTime, closingTime, duration, availableDays, status
      MeetingRoom.findAll({
        where: { status: { [Op.in]: ACTIVE_STATUSES } },
        attributes: [
          'id',
          'LocationId',
          'openingTime',
          'closingTime',
          'duration',
          'availableDays',
          'status'
        ]
      }),
      // Attribute bookings via room_id → MeetingRoom.LocationId (not Booking.location_id)
      Booking.findAll({
        where: {
          date: today,
          status: CONFIRMED_BOOKING_STATUS
        },
        attributes: ['id', 'startTime', 'endTime', 'status', 'slots', 'room_id'],
        include: [
          {
            model: MeetingRoom,
            as: 'Room',
            attributes: ['id', 'LocationId', 'duration', 'openingTime', 'closingTime'],
            required: true
          }
        ]
      }),
      Booking.findAll({
        where: {
          date: {
            [Op.between]: [
              getLocalDateString(lastWeekStart),
              getLocalDateString(lastWeekEnd)
            ]
          },
          status: CONFIRMED_BOOKING_STATUS
        },
        attributes: ['id', 'date', 'startTime', 'endTime', 'status', 'slots', 'room_id'],
        include: [
          {
            model: MeetingRoom,
            as: 'Room',
            attributes: ['id', 'LocationId', 'duration'],
            required: true
          }
        ]
      })
    ]);

    const inProgressCount = todaysBookings.filter(
      (booking) => deriveBookingDisplayStatus(booking, now) === 'Ongoing'
    ).length;

    const {
      occupancyByLocation,
      avgOccupancy
    } = buildOccupancyByLocation(activeLocations, activeRooms, todaysBookings, now);

    // Last week: day-by-day capacity from openingTime/closingTime/availableDays
    let lastWeekCapacity = 0;
    let lastWeekBooked = 0;
    const lastWeekDates = eachDateInclusive(lastWeekStart, lastWeekEnd);

    lastWeekDates.forEach((date) => {
      activeRooms.forEach((room) => {
        if (!isRoomAvailableOnDate(room, date)) return;
        lastWeekCapacity += getRoomCapacityMinutes(room);
      });

      const dateKey = getLocalDateString(date);
      lastWeekBookings.forEach((booking) => {
        if (normalizeDateOnly(booking.date) !== dateKey) return;
        const slotMinutes = Number(booking.Room?.duration) || DEFAULT_SLOT_MINUTES;
        lastWeekBooked += getBookingDurationMinutes(booking, slotMinutes);
      });
    });

    const lastWeekAvg = lastWeekCapacity > 0
      ? Math.min(100, Math.round((lastWeekBooked / lastWeekCapacity) * 100))
      : 0;
    const occupancyDelta = avgOccupancy - lastWeekAvg;

    return {
      stats: {
        locations: {
          value: locationsCount,
          badge: `+${locationsThisMonth} this month`
        },
        meeting_rooms: {
          value: meetingRoomsCount,
          badge: `${activeMeetingRooms} active`
        },
        companies: {
          value: companiesCount,
          badge: `+${companiesThisMonth} this month`
        },
        active_users: {
          value: activeUsersCount,
          badge: `+${usersThisWeek} this week`
        },
        bookings_today: {
          value: bookingsTodayCount,
          badge: `${inProgressCount} in progress`
        },
        avg_occupancy: {
          value: avgOccupancy,
          badge: occupancyDelta >= 0
            ? `▲ ${occupancyDelta}% vs last wk`
            : `▼ ${Math.abs(occupancyDelta)}% vs last wk`
        }
      },
      occupancy_by_location: occupancyByLocation
    };
  } catch (error) {
    Logger.error('Something went wrong in Dashboard Repo: getDashboardSummary', error);
    throw error;
  }
}

/// Today's bookings list with pagination
async function getTodaysBookings(limit, offset) {
  try {
    const today = getLocalDateString();
    const now = new Date();

    const { count, rows: bookings } = await Booking.findAndCountAll({
      where: {
        date: today,
        status: CONFIRMED_BOOKING_STATUS
      },
      include: [
        {
          model: MeetingRoom,
          as: 'Room',
          attributes: ['id', 'name'],
          include: [
            {
              model: Location,
              as: 'location',
              attributes: ['id', 'name']
            }
          ]
        },
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name'],
          include: [
            {
              model: Company,
              as: 'Company',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['startTime', 'ASC']],
      limit,
      offset,
      distinct: true
    });

    const mappedBookings = bookings.map((booking) => ({
      id: booking.id,
      room: booking.Room?.name || 'N/A',
      room_id: booking.room_id,
      company: booking.User?.Company?.name || 'N/A',
      company_id: booking.company_id,
      user: booking.User?.name || 'N/A',
      user_id: booking.user_id,
      time: formatTimeRange(booking.startTime, booking.endTime),
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: deriveBookingDisplayStatus(booking, now),
      title: booking.title,
      total_credits: booking.total_credits,
      location: booking.Room?.location?.name || 'N/A'
    }));

    return {
      total_items: count,
      total_pages: Math.ceil(count / limit) || 0,
      current_page: Math.floor(offset / limit) + 1,
      page_size: limit,
      bookings: mappedBookings
    };
  } catch (error) {
    Logger.error('Something went wrong in Dashboard Repo: getTodaysBookings', error);
    throw error;
  }
}

/// Low wallet balance users, paginated
async function getWalletAlerts(limit, offset, threshold = DEFAULT_LOW_BALANCE_THRESHOLD) {
  try {
    const { count, rows: wallets } = await Wallet.findAndCountAll({
      where: {
        [Op.or]: [
          { meeting_room_credits: { [Op.lte]: threshold } },
          { printing_credits: { [Op.lte]: threshold } }
        ]
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email', 'status'],
          include: [
            {
              model: Company,
              as: 'Company',
              attributes: ['id', 'name'],
              include: [
                {
                  model: Location,
                  as: 'location',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ],
      order: [['meeting_room_credits', 'ASC']],
      limit,
      offset,
      distinct: true
    });

    const alerts = wallets.map((wallet) => {
      const user = wallet.User;
      const companyName = user?.Company?.name || 'N/A';
      const meetingCredits = Number(wallet.meeting_room_credits) || 0;
      const printingCredits = Number(wallet.printing_credits) || 0;

      const lowParts = [];
      if (meetingCredits <= threshold) {
        lowParts.push(`Meeting Room: ${meetingCredits.toFixed(2)}`);
      }
      if (printingCredits <= threshold) {
        lowParts.push(`Printing: ${printingCredits.toFixed(2)}`);
      }

      return {
        user_id: user?.id,
        name: user?.name || 'N/A',
        email: user?.email || null,
        company: companyName,
        company_id: user?.Company?.id || null,
        location: user?.Company?.location?.name || 'N/A',
        meeting_room_credits: meetingCredits,
        printing_credits: printingCredits,
        detail: `${companyName} · ${lowParts.join(' · ')}`
      };
    });

    return {
      total_items: count,
      total_pages: Math.ceil(count / limit) || 0,
      current_page: Math.floor(offset / limit) + 1,
      page_size: limit,
      threshold,
      alerts
    };
  } catch (error) {
    Logger.error('Something went wrong in Dashboard Repo: getWalletAlerts', error);
    throw error;
  }
}

/// Recently added companies, paginated
async function getRecentCompanies(limit, offset) {
  try {
    const { count, rows: companies } = await Company.findAndCountAll({
      include: [
        {
          model: Location,
          as: 'location',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true
    });

    const mapped = companies.map((company) => ({
      id: company.id,
      name: company.name,
      location: company.location?.name || company.locationName || 'N/A',
      location_id: company.LocationId,
      status: company.status || 'N/A',
      email: company.email,
      createdAt: company.createdAt
    }));

    return {
      total_items: count,
      total_pages: Math.ceil(count / limit) || 0,
      current_page: Math.floor(offset / limit) + 1,
      page_size: limit,
      companies: mapped
    };
  } catch (error) {
    Logger.error('Something went wrong in Dashboard Repo: getRecentCompanies', error);
    throw error;
  }
}

module.exports = {
  getDashboardSummary,
  getTodaysBookings,
  getWalletAlerts,
  getRecentCompanies,
  DEFAULT_LOW_BALANCE_THRESHOLD
};

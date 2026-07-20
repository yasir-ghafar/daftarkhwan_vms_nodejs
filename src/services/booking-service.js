const { sequelize, Location, MeetingRoom } = require("../models");
const userRepo = require("../repositories/user-repository");
const walletRepo = require("../repositories/wallet-repository");
const activityRepo = require("../repositories/activity-repository");
const bookingRepo = require("../repositories/booking-repository");

const AppError = require("../utils/error/app-error");
const { StatusCodes } = require("http-status-codes");

const SLOT_DURATION_MINS = 30;

/// Utility Method Required In Repo
function validateSlotTiming(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start) || isNaN(end)) {
    throw new AppError("Invalid start or end time", StatusCodes.BAD_REQUEST);
  }

  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (!isSameDay) {
    throw new AppError(
      "Start and end time must be on the same date",
      StatusCodes.BAD_REQUEST
    );
  }

  const opening = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 9, 0, 0);
  const closing = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 21, 0, 0);

  return start >= opening && end <= closing;
}

// FIX: normalize any accepted time input to HH:mm:ss for consistent TIME comparisons
function toTimeOnly(value) {
  if (value == null) {
    throw new AppError("Invalid start or end time", StatusCodes.BAD_REQUEST);
  }

  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      throw new AppError("Invalid start or end time", StatusCodes.BAD_REQUEST);
    }
    return formatTimeMinutes(value.getUTCHours() * 60 + value.getUTCMinutes());
  }

  const str = String(value).trim();
  const isoMatch = str.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (isoMatch) {
    return `${isoMatch[1]}:${isoMatch[2]}:${isoMatch[3] || "00"}`;
  }

  const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (timeMatch) {
    return `${String(Number(timeMatch[1])).padStart(2, "0")}:${timeMatch[2]}:${timeMatch[3] || "00"}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return formatTimeMinutes(parsed.getUTCHours() * 60 + parsed.getUTCMinutes());
  }

  throw new AppError("Invalid start or end time", StatusCodes.BAD_REQUEST);
}

function timeToMinutes(timeOnly) {
  const [hours, minutes] = timeOnly.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTimeMinutes(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
}

// FIX: expand booking window into discrete 30-min slot starts for unique DB rows
function expandThirtyMinuteSlots(startTimeOnly, endTimeOnly) {
  const startMins = timeToMinutes(startTimeOnly);
  const endMins = timeToMinutes(endTimeOnly);

  if (endMins <= startMins) {
    throw new AppError(
      "Time must align with 30-minute slot boundaries",
      StatusCodes.BAD_REQUEST
    );
  }

  if ((endMins - startMins) % SLOT_DURATION_MINS !== 0) {
    throw new AppError(
      "Time must align with 30-minute slot boundaries",
      StatusCodes.BAD_REQUEST
    );
  }

  const slotStarts = [];
  for (let current = startMins; current < endMins; current += SLOT_DURATION_MINS) {
    slotStarts.push(formatTimeMinutes(current));
  }
  return slotStarts;
}

function isDuplicateSlotError(error) {
  return (
    error?.name === "SequelizeUniqueConstraintError" ||
    error?.original?.code === "ER_DUP_ENTRY" ||
    error?.parent?.code === "ER_DUP_ENTRY"
  );
}

/// Method to create a booking against a meeting room
async function bookMeetingRoom({
  booking_user,
  date,
  startTime,
  endTime,
  location_id,
  room_id,
  company_id,
  user_id,
  status, // kept for request compatibility; ignored — server forces confirmed
  title,
  description
}) {
  console.log({ booking_user, user_id, room_id });
  const transaction = await sequelize.transaction();

  try {
    /// Check if the booking time is according to slots
    if (!validateSlotTiming(startTime, endTime)) {
      throw new AppError(
        "Booking must be between 9:00 AM and 9:00 PM",
        StatusCodes.BAD_REQUEST
      );
    }

    // FIX: normalize times before availability check / slot reservation
    const normalizedStartTime = toTimeOnly(startTime);
    const normalizedEndTime = toTimeOnly(endTime);

    // FIX: lock meeting room row so concurrent creates for this room serialize
    const room = await MeetingRoom.findByPk(room_id, {
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"]
        }
      ],
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!room)
      throw new AppError("Meeting Room Not Found", StatusCodes.NOT_FOUND);

    console.log(room);
    /// check if the slots are aligned with 30 minutes time.
    const slotStarts = expandThirtyMinuteSlots(normalizedStartTime, normalizedEndTime);
    const slots = slotStarts.length;
    console.log(`TotalSlots ${slots}`);
    if (!Number.isInteger(slots) || slots <= 0) {
      throw new AppError(
        "Time must align with 30-minute slot boundaries",
        StatusCodes.BAD_REQUEST
      );
    }
    // calculate how may credits will cost this booking.
    const cost = slots * room.creditsPerSlot;

    /// check if slots are available. this will check on the bases of start time and end time. and number of slots
    const isAvailable = await bookingRepo.areSlotsAvailable(
      {
        room_id,
        date,
        slots,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime
      },
      transaction
    );
    if (!isAvailable) { 
      throw new AppError(
        "The selected room is already booked during the requested time.",
        StatusCodes.CONFLICT
      );
    }

    /// get user wallet, throws error if does not exists
    const user = await userRepo.getUserWithWallet(user_id, transaction);
      
    if (!user || !user.Wallet)
      throw new AppError("User or Wallet Not found", StatusCodes.NOT_FOUND);

    const companyName = user?.Company?.name ?? "N/A";
    const locationName = user?.Company?.location?.name ?? "N/A";
    console.log("User Company in Repo:", companyName);
    console.log("User Location in Repo:", locationName);
    console.log(`${user.name} has Wallet with Balance ${user.Wallet.meeting_room_credits}`);
    console.log(`Booking cost is ${cost} Credits`);
    /// check if user have balance in wallet and in does not below the cost of the meeting.
    if (user.Wallet.meeting_room_credits < cost)
      throw new AppError("Insufficient wallet balance", StatusCodes.FORBIDDEN);

    //Deduct balance
    await walletRepo.updateWalletBalance(user.Wallet, -cost, transaction);

    //Log transaction
    await walletRepo.logWalletTransaction(
      user.Wallet.id,
      "debit",
      cost,
      `Booking room ${room.name} for ${slots} slots`,
      transaction
    );

    // FIX: server owns status — always confirmed (request may still send status; ignored)
    const booking = await bookingRepo.createBooking(
      {
        date: date,
        startTime: normalizedStartTime,
        endTime: normalizedEndTime,
        slots: slots,
        location_id: location_id,
        room_id: room_id,
        company_id: company_id,
        user_id: user_id,
        total_credits: cost,
        status: "confirmed",
        title: title,
        description: description
      },
      transaction
    );

    // FIX: insert discrete slot rows — UNIQUE index is final duplicate guard
    await bookingRepo.createBookingSlots(
      {
        booking_id: booking.id,
        room_id,
        date,
        slotStarts
      },
      transaction
    );

    // 11️⃣ Log activity (atomic with the transaction)
    await activityRepo.logActivity(
      {
        userId: user_id,
        action: "BOOKING_CREATED",
        targetId: booking.id,
        targetType: "MeetingRoomBooking",
        metadata: {
          roomName: room.name,
          company: companyName,
          location: room.location?.name || "N/A",
          date,
          startTime: normalizedStartTime,
          endTime: normalizedEndTime,
          totalCredits: cost,
          slots
        },
        performedBy: booking_user || user_id
      },
      transaction
    );


    await transaction.commit();
    return booking;
  } catch (error) {
    console.log(error);
    await transaction.rollback();

    // Preserve intentional AppError status codes (400/403/404/409/…)
    if (error instanceof AppError) {
      throw error;
    }

    // FIX: map unique-slot violations to the same conflict message clients already expect
    if (isDuplicateSlotError(error)) {
      throw new AppError(
        "The selected room is already booked during the requested time.",
        StatusCodes.CONFLICT
      );
    }

    // Never rethrow raw errors — controller requires a numeric statusCode
    throw new AppError(
      error.message || "Something went wrong.",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

/// Get All Bookings
async function getAllBookings(limit, offset) {
    try {
        //const bookings = await bookingRepo.getBookings();
        const result = await bookingRepo.getBookingsWithPagination(limit, offset);
        return result;
    } catch(error) {
        if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Airplane object",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
    }
}

/// Get Bookings by a User
async function getAllBookingsByUserId(userId) {
    try {
        const bookings = await bookingRepo.getBookingsByUserId(userId);
        return bookings
    } catch(error) {
        if (error.name == "SequelizeValidationError") {
      let explanation = [];
      error.errors.array.forEach((err) => {
        explanation.push(err.message);
      });
      console.log(explanation);
      throw new AppError(
        "Cannot create a new Airplane object",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    throw error;
    }
}

/// Cancel Booking
async function cancelBooking(bookingId, userId, isAdmin = false) {
  const transaction = await sequelize.transaction();

  try {
    console.log("Booking Id:", bookingId);
    console.log("User Id:", userId);

    // Fetch booking with room and wallet details
    const booking = await bookingRepo.getBookingWithUserandRoom(
      bookingId,
      transaction
    );

    if (!booking) {
      throw new AppError("Booking not found", StatusCodes.NOT_FOUND);
    }

    if (booking.status === 'cancelled') {

      
      throw new AppError("Booking is already cancelled", StatusCodes.BAD_REQUEST);
    }

    // Prevent non-admin users from cancelling someone else's booking
    if (!isAdmin && booking.user_id !== userId) {
      throw new AppError(
        "Unauthorized cancellation attempt",
        StatusCodes.UNAUTHORIZED
      );
    }

    // Prevent cancellation of past or ongoing bookings
    const now = new Date();
    const nowDateUTC = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );
    const nowTimeUTC = now.getUTCHours() * 60 + now.getUTCMinutes();

    const bookingDate = new Date(`${booking.date}T00:00:00.000Z`);
    const bookingStart = new Date(booking.startTime);
    const bookingTimeMins =
      bookingStart.getUTCHours() * 60 + bookingStart.getUTCMinutes();

    if (bookingDate < nowDateUTC) {
      throw new AppError(
        "Cannot cancel a booking for a past date",
        StatusCodes.BAD_REQUEST
      );
    }

    if (
      bookingDate.getTime() === nowDateUTC.getTime() &&
      bookingTimeMins <= nowTimeUTC
    ) {
      throw new AppError(
        "Cannot cancel a booking that has already started",
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingStart <= now) {
      throw new AppError(
        "Cannot cancel a past or ongoing booking",
        StatusCodes.BAD_REQUEST
      );
    }

    // Get user's wallet (refund goes to the original booking owner, not the admin)
    const bookingUser = await userRepo.getUserWithWallet(booking.user_id, transaction);
    if (!bookingUser || !bookingUser.Wallet) {
      throw new AppError("User or Wallet not found", StatusCodes.NOT_FOUND);
    }

    const refundAmount = booking.total_credits;

    await walletRepo.updateWalletBalance(
      bookingUser.Wallet,
      refundAmount,
      transaction
    );

    // Log refund transaction
    await walletRepo.logWalletTransaction(
      bookingUser.Wallet.id,
      'credit',
      refundAmount,
      `Refund for canceled booking ID ${bookingId}`,
      transaction
    );

    // Mark booking as cancelled (also deletes BookingSlots inside repo)
    await bookingRepo.cancelBookingById(bookingId, transaction);

    await transaction.commit();
    return "Booking cancelled and wallet refunded successfully.";
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/// method to get Bookings of a single meeting room on a specific date.
async function getBookingsByRoomIdAndDate(roomId, date) {
  console.log('getting in service');

  if (!roomId || !date) {
    throw new AppError(
      'room_id and date are required',
      StatusCodes.BAD_REQUEST
    );
  }

  try {
    const bookings = await bookingRepo.getBookingsByRoomAndDate(roomId, date);

    if (!bookings || bookings.length === 0) {
      throw new AppError(
        'No booking found for today',
        StatusCodes.NOT_FOUND
      );
    }

    return bookings;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const explanation = error.errors.map(err => err.message);

      throw new AppError(
        `Validation error: ${explanation.join(', ')}`,
        StatusCodes.BAD_REQUEST
      );
    }

    // For any other errors, just rethrow
    throw error;
  }
}




module.exports = {
  bookMeetingRoom,
  getAllBookings,
  cancelBooking,
  getBookingsByRoomIdAndDate,
  getAllBookingsByUserId,
};

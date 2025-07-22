const { sequelize } = require('../models');
const userRepo = require('../repositories/user-repository');
const walletRepo = require('../repositories/wallet-repository');
const bookingRepo = require('../repositories/booking-repository');

const AppError = require('../utils/error/app-error');
const { StatusCodes } = require('http-status-codes');

const { MeetingRoomRepository } = require('../repositories');

const meetingRoomRepository = new MeetingRoomRepository();


function validateSlotTiming(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Ensure valid dates
  if (isNaN(start) || isNaN(end)) {
    throw new Error('Invalid start or end time');
  }

  // Ensure both times are on the same day
  const isSameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();

  if (!isSameDay) {
    throw new Error('Start and end time must be on the same date');
  }

  const opening = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
    9, 0, 0, 0
  ));

  const closing = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
    21, 0, 0, 0
  ));

  const isValid = start >= opening && end <= closing;

  console.log('Opening:', opening.toISOString());
  console.log('Closing:', closing.toISOString());
  console.log('Start:', start.toISOString());
  console.log('End:', end.toISOString());
  console.log('Is Valid', isValid);

  return isValid;
}


async function bookMeetingRoom({date, startTime, endTime, location_id, room_id, company_id, user_id }) {
    console.log({user_id, room_id});
    const transaction = await sequelize.transaction();

    try {

        /// Check if the booking time is according to slots
        if (!validateSlotTiming(startTime, endTime)) {
          throw new AppError('Booking must be between 9:00 AM and 9:00 PM', StatusCodes.BAD_REQUEST);
        }

        /// check if the meeting room exists.
        const room = await meetingRoomRepository.get(room_id, transaction);
        if (!room) throw new AppError('Meeting Room Not Found', StatusCodes.NOT_FOUND);

        /// check if the slots are aligned with 30 minutes time.
        const slotDurationMins = 30;
        const slots = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * slotDurationMins);
        console.log(`Total Slots ${slots}`)
        if (!Number.isInteger(slots) || slots <= 0) {
            throw new AppError('Time must align with 30-minute slot boundaries', StatusCodes.BAD_REQUEST);
        }
        // calculate how may credits will cost this booking.
        const cost = slots * room.creditsPerSlot;
       
        /// check if slots are available. this will check on the bases of start time and end time. and number of slots
        const isAvailable = await bookingRepo.areSlotsAvailable({room_id, date, slots, startTime, endTime}, transaction);
        if (!isAvailable) {
          throw new AppError('The selected room is already booked during the requested time.', StatusCodes.CONFLICT);
        }
        

        /// get user wallet, throws error if does not exists
        const user = await userRepo.getUserWithWallet(user_id, transaction);
        if (!user || !user.Wallet) throw new AppError('User or Wallet Not found', StatusCodes.NOT_FOUND);

        console.log(`${user.name} has Wallet with Balance ${user.Wallet.balance}` );
        console.log(`Booking cost is ${cost} Credits`);
        /// check if user have balance in wallet and in does not below the cost of the meeting.
        if (user.Wallet.balance < cost) throw new AppError('Insufficient wallet balance', StatusCodes.FORBIDDEN);

        //Deduct balance
        await walletRepo.updateWalletBalance(user.Wallet, -cost, transaction);

        //Log transaction
        await walletRepo.logWalletTransaction(
            user.Wallet.id,
            'debit',
            cost,
            `Booking room ${room.name} for ${slots} slots`,
            transaction
        );

        //createBooking
        const booking = await bookingRepo.createBooking({ 
          date: date,
          startTime, startTime,
          endTime: endTime,
          slots: slots,
          location_id: location_id,
          room_id: room_id,
          company_id: company_id,
          user_id: user_id,
          total_credits: cost
         }, transaction);

        await transaction.commit();
        return booking;
    } catch(error) {
        console.log(error);
        await transaction.rollback();
        throw error;
    }
}


module.exports = { bookMeetingRoom };
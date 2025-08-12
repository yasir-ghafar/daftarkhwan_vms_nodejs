const { sequelize , Booking, MeetingRoom, Location, User, Company } = require('../models');
const { Logger } = require('../config');
const { Op, where } = require('sequelize');

async function createBooking({ date, startTime, endTime, slots, location_id, room_id, company_id, user_id, total_credits, status, title, description }, transaction) {
  console.log("Booking Status is:", status);  
  return await Booking.create({
      user_id: user_id,
      room_id: room_id,
      date: date,
      slots: slots,
      serialNumber: '',
      location_id: location_id,
      company_id: company_id,
      startTime: startTime,
      endTime: endTime,
      total_credits: total_credits,
      status: status,
      title: title,
      description: description
    }, { transaction });
}

async function areSlotsAvailable({ room_id, date, slots, startTime, endTime }, transaction) {
  const [results] = await sequelize.query(
    `
    SELECT id
    FROM Bookings
    WHERE room_id = :room_id
      AND date = :date
      AND NOT (
        :endTime <= startTime OR
        :startTime >= endTime
      )
    `,
    {
      replacements: {
        room_id,
        date,
        startTime,
        endTime
      },
      transaction
    }
  );

  return results.length === 0;
}


async function getBookings() {
  try {
    return await Booking.findAll({
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
      ]
    });
  } catch (error) {
    Logger.error('Something went wrong in Booking Repo: getBookings', error);
    throw error;
  }
}

async function getBookingsByUserId(userId) {
  try {
    console.log("User Id in repo:", userId)
    return await Booking.findAll({
    where: {user_id: userId },
    include: [
      {
        model: MeetingRoom,
        as: 'Room',
        attributes: ['id', 'name'],
        include: [
          {
            model: Location,
            as: 'location',
            attributes: ['id', 'name'],
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
            attributes: ['id', 'name'],
          }
        ]
      }
    ]
  });
  } catch (error) {
    Logger.error('Something went wrong in Booking Repo: getBookings', error);
    throw error;
  }
}


async function getBookingsByMeetingRoomId() {
  try {
    return await Booking.findAll({
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
      ]
    });
  } catch (error) {
    Logger.error('Something went wrong in Booking Repo: getBookings', error);
    throw error;
  }
}


async function getBookingWithUserandRoom(bookingId, transaction) {

  console.log('Logged In Repo: ', bookingId);
  return await Booking.findOne({
    where: {id: bookingId },
    include: [
      {
        model: MeetingRoom,
        as: 'Room'
      },
    ],
    transaction
  });
}

async function cancelBookingById(bookingId, transaction) {
  const [affectedRows] = await Booking.update(
    { status: 'cancelled' },
    {
      where: { id: bookingId },
      transaction
    }
  );

  if (affectedRows === 0) {
    throw new AppError('Booking not found or already cancelled', StatusCodes.NOT_FOUND);
  }

  return true; // or return the updated booking if needed
}

async function deleteBooking(bookingId, transaction) {
  return await this.Booking.destroy({ where: { id: bookingId }, transaction });
}


async function getBookingsByRoomAndDate(roomId, date) {

  console.log("Room Id", roomId);
  console.log("Date", date);
  return await Booking.findAll({
    where: {
      room_id: roomId,
      date: date, // filtering by exact date
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
            attributes: ['id', 'name'],
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
            attributes: ['id', 'name'],
          }
        ]
      }
    ]
  });
}


module.exports = { 
  createBooking,
  getBookings,
  areSlotsAvailable,
  cancelBookingById,
  getBookingWithUserandRoom,
  deleteBooking,
  getBookingsByRoomAndDate,
  getBookingsByMeetingRoomId,
  getBookingsByUserId
};
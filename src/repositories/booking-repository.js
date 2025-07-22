const { sequelize , Booking } = require('../models');

async function createBooking({ date, startTime, endTime, slots, location_id, room_id, company_id, user_id, total_credits }, transaction) {
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
      total_credits: total_credits
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

module.exports = { 
  createBooking,
  areSlotsAvailable
};
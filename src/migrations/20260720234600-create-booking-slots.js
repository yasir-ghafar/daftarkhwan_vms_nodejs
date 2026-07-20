'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookingSlots', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      slot_start: {
        type: Sequelize.TIME,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // FIX: DB-level uniqueness — one active slot per room/date/time
    await queryInterface.addIndex('BookingSlots', ['room_id', 'date', 'slot_start'], {
      unique: true,
      name: 'uniq_booking_slots_room_date_slot'
    });

    // Backfill discrete slots from existing non-cancelled bookings (ignore conflicts)
    const [bookings] = await queryInterface.sequelize.query(`
      SELECT id, room_id, date, startTime, endTime
      FROM Bookings
      WHERE status IS NULL OR status != 'cancelled'
    `);

    const now = new Date();
    const rows = [];

    for (const booking of bookings) {
      const starts = expandThirtyMinuteSlots(booking.startTime, booking.endTime);
      for (const slot_start of starts) {
        rows.push({
          booking_id: booking.id,
          room_id: booking.room_id,
          date: booking.date,
          slot_start,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    if (rows.length > 0) {
      for (const row of rows) {
        await queryInterface.sequelize.query(
          `
          INSERT IGNORE INTO BookingSlots
            (booking_id, room_id, date, slot_start, createdAt, updatedAt)
          VALUES
            (:booking_id, :room_id, :date, :slot_start, :createdAt, :updatedAt)
          `,
          {
            replacements: row
          }
        );
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('BookingSlots');
  }
};

function toMinutes(timeValue) {
  if (timeValue == null) return null;

  if (timeValue instanceof Date) {
    return timeValue.getUTCHours() * 60 + timeValue.getUTCMinutes();
  }

  const str = String(timeValue).trim();
  const isoMatch = str.match(/T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (isoMatch) {
    return Number(isoMatch[1]) * 60 + Number(isoMatch[2]);
  }

  const timeMatch = str.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (timeMatch) {
    return Number(timeMatch[1]) * 60 + Number(timeMatch[2]);
  }

  return null;
}

function formatTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

function expandThirtyMinuteSlots(startTime, endTime) {
  const startMins = toMinutes(startTime);
  const endMins = toMinutes(endTime);
  if (startMins == null || endMins == null || endMins <= startMins) {
    return [];
  }

  const slots = [];
  for (let current = startMins; current < endMins; current += 30) {
    slots.push(formatTime(current));
  }
  return slots;
}

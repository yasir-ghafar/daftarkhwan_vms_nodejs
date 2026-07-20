'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BookingSlot extends Model {
    static associate(models) {
      BookingSlot.belongsTo(models.Booking, { foreignKey: 'booking_id' });
      BookingSlot.belongsTo(models.MeetingRoom, { foreignKey: 'room_id', as: 'Room' });
    }
  }

  BookingSlot.init({
    booking_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    date: DataTypes.DATEONLY,
    slot_start: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'BookingSlot',
  });

  return BookingSlot;
};

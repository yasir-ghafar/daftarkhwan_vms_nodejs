'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.User, {foreignKey: 'user_id'});
      Booking.belongsTo(models.MeetingRoom, { foreignKey: 'room_id', as: 'Room' })
      // FIX: discrete slot rows enforce unique room/date/time at DB level
      Booking.hasMany(models.BookingSlot, { foreignKey: 'booking_id', as: 'Slots' });
    }
  }

  Booking.init({
    date: DataTypes.DATEONLY,
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    slots: DataTypes.INTEGER,
    serialNumber: DataTypes.STRING,
    location_id: DataTypes.INTEGER,
    room_id: DataTypes.INTEGER,
    company_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    total_credits: DataTypes.INTEGER,
    status: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};
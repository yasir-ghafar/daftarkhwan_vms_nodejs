'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MeetingRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MeetingRoom.hasMany(models.Booking, { foreignKey: 'room_id' });
    }
  }
  MeetingRoom.init({
    name: DataTypes.STRING,
    creditsPerSlot: DataTypes.INTEGER,
    pricePerCredit: DataTypes.DECIMAL,
    seatingCapacity: DataTypes.INTEGER,
    image: DataTypes.STRING,
    openingTime: DataTypes.TIME,
    closingTime: DataTypes.TIME,
    floor: DataTypes.STRING,
    availableDays: DataTypes.JSON,
    LocationId: DataTypes.INTEGER,
    meeting_room_credits: DataTypes.DECIMAL,
    printing_credits: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'MeetingRoom',
  });
  return MeetingRoom;
};
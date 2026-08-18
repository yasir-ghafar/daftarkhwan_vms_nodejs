'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lounge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lounge.belongsTo(models.Location, { foreignKey: 'LocationId', as: 'location'});
    }
  }
  Lounge.init({
    Name: DataTypes.TEXT,
    LocationId: DataTypes.INTEGER,
    Floor: DataTypes.TEXT,
    capacity: DataTypes.INTEGER,
    image: DataTypes.STRING,
    availableDays: DataTypes.JSON,
    openingTime: DataTypes.TIME,
    closingTime: DataTypes.TIME,
    slotDuration: DataTypes.DOUBLE,
    creditsPerSlot: DataTypes.DECIMAL,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Lounge',
  });
  return Lounge;
};
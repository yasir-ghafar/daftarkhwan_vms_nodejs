'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Studio extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Studio.init({
    name: DataTypes.STRING,
    locationId: DataTypes.INTEGER,
    floor: DataTypes.STRING,
    pricePerCredit: DataTypes.DECIMAL,
    seatingCapacity: DataTypes.INTEGER,
    image: DataTypes.STRING,
    openingTime: DataTypes.TIME,
    closingTime: DataTypes.TIME,
    availableDays: DataTypes.JSON,
    amenities: DataTypes.JSON,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Studio',
  });
  return Studio;
};
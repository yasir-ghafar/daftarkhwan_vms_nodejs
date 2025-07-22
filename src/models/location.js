'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Location.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contactNumber: DataTypes.STRING,
    email: DataTypes.STRING,
    legalBusinessName: DataTypes.STRING,
    address: DataTypes.TEXT,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};
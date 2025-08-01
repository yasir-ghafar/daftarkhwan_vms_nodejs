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
      Location.hasMany(models.Company, {
        foreignKey: 'LocationId',
        as: 'companies'
      })

      Location.hasMany(models.MeetingRoom, {
        foreignKey: 'LocationId',
        as: 'rooms'
      })
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
    city: DataTypes.STRING,
    status: DataTypes.STRING,
    image: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};
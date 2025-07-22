'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Company extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Company.hasMany(models.User, { foreignKey: 'company_id' } );
    }
  }
  Company.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    contactNumber: DataTypes.STRING,
    businessType: DataTypes.STRING,
    websiteUrl: DataTypes.STRING,
    reference: DataTypes.STRING,
    cin: DataTypes.STRING,
    pan: DataTypes.STRING,
    gstn: DataTypes.STRING,
    tan: DataTypes.STRING,
    billingAddress: DataTypes.TEXT,
    LocationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Company',
  });
  return Company;
};
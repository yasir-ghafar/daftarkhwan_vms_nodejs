'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Wallet, { foreignKey: 'user_id' });
      User.hasMany(models.Booking, { foreignKey: 'user_id' });
      User.belongsTo(models.Company, { foreignKey: 'company_id' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    role: DataTypes.ENUM('admin', 'member'),
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING,
    company_id: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
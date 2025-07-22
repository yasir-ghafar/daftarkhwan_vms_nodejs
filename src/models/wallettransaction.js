'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WalletTransaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      WalletTransaction.belongsTo(models.Wallet, { foreignKey: 'wallet_id' });    
    }
  }
  WalletTransaction.init({
    wallet_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    reason: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WalletTransaction',
  });
  return WalletTransaction;
};
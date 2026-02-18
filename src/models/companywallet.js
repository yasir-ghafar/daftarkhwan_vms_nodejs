'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyWallet extends Model {
    static associate(models) {
      CompanyWallet.belongsTo(models.Company, {
        foreignKey: 'company_id',
      });

      CompanyWallet.hasMany(models.WalletTransaction, {
        foreignKey: 'company_wallet_id',
      });
    }
  }

  CompanyWallet.init(
    {
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      meeting_room_credits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      monthly_credits: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      auto_renewal: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'CompanyWallet',
      tableName: 'CompanyWallets', // keep explicit to avoid naming confusion
    }
  );

  return CompanyWallet;
};

'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Activity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Activity.belongsTo(models.User, {as: 'user', foreignKey: 'userId'});

      Activity.belongsTo(models.User, { as: 'performedByUser', // alias for performer
      foreignKey: 'performedBy',});
    }
  }
  Activity.init({
    userId: DataTypes.INTEGER,
    action: DataTypes.STRING,
    targetId: DataTypes.STRING,
    targetType: DataTypes.STRING,
    metadata: DataTypes.JSON,
    performedBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Activity',
  });
  return Activity;
};
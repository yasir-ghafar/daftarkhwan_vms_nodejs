'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MeetingRooms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      creditsPerSlot: {
        type: Sequelize.INTEGER
      },
      pricePerCredit: {
        type: Sequelize.DECIMAL
      },
      seatingCapacity: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      openingTime: {
        type: Sequelize.TIME
      },
      closingTime: {
        type: Sequelize.TIME
      },
      floor: {
        type: Sequelize.STRING
      },
      availableDays: {
        type: Sequelize.JSON
      },
      LocationId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MeetingRooms');
  }
};
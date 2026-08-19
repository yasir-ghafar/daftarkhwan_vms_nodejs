'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Studios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      locationId: {
        type: Sequelize.INTEGER
      },
      floor: {
        type: Sequelize.STRING
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
      availableDays: {
        type: Sequelize.JSON
      },
      amenities: {
        type: Sequelize.JSON
      },
      status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Studios');
  }
};
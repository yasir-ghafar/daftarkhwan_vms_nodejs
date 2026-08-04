'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Lounges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      Name: {
        type: Sequelize.STRING
      },
      locationId: {
        type: Sequelize.INTEGER
      },
      floor: {
        type: Sequelize.TEXT
      },
      capacity: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.STRING
      },
      availableDays: {
        type: Sequelize.JSON
      },
      openingTime: {
        type: Sequelize.DATE
      },
      closingTime: {
        type: Sequelize.DATE
      },
      slotDuration: {
        type: Sequelize.DOUBLE
      },
      creditsPerSlot: {
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.BOOLEAN
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
    await queryInterface.dropTable('Lounges');
  }
};
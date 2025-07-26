'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn('MeetingRooms', 'status', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('MeetingRooms', 'locationName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.removeColumn('MeetingRooms', 'status');
    await queryInterface.removeColumn('MeetingRooms', 'locationName');
  }
};

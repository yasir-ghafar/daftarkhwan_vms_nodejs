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
    await queryInterface.removeColumn('MeetingRooms', 'meeting_room_credits');
    await queryInterface.removeColumn('MeetingRooms', 'printing_credits');
    await queryInterface.removeColumn('MeetingRooms', 'locationName');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.addColumn('MeetingRooms', 'meeting_room_credits', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    });

    await queryInterface.addColumn('MeetingRooms', 'printing_credits', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00
    });
    await queryInterface.addColumn('MeetingRooms', 'locationName', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};

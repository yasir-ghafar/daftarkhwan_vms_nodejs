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
    await queryInterface.changeColumn('MeetingRooms', 'creditsPerSlot', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false, // adjust if column can be null
      defaultValue: 0.0
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.changeColumn('MeetingRooms', 'creditsPerSlot', {
      type: Sequelize.INTEGER,
      allowNull: false, // match original column definition
    });
  }
};

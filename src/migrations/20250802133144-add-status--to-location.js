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

    await queryInterface.addColumn('Locations', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active'
    });
    
    await queryInterface.removeColumn('Locations', 'state');
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.addColumn('Locations', 'state', {
      type: Sequelize.STRING,
      allowNull: true // adjust based on old schema
    });

    // Remove 'status' column
    await queryInterface.removeColumn('Locations', 'status');
  }
};

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

    await queryInterface.changeColumn('Companies', 'status', {
      type: Sequelize.STRING, // or Sequelize.ENUM if you’re using enum
      allowNull: false,
      defaultValue: 'Active', // change this to your desired default
    });

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.changeColumn('Companies', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: null, // rollback to no default
    });

    
  }
};

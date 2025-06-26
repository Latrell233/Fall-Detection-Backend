const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 添加唯一约束到user_id字段
    await queryInterface.addConstraint('devices', {
      fields: ['user_id'],
      type: 'unique',
      name: 'devices_user_id_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 移除唯一约束
    await queryInterface.removeConstraint('devices', 'devices_user_id_unique');
  }
}; 
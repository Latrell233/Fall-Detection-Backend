const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
const Device = sequelize.define('Device', {
  device_id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  device_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  install_location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  device_secret: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'offline'
  },
  last_active: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  config_json: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  underscored: true
});

  return Device;
}; 
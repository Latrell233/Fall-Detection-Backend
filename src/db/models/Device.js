const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
const Device = sequelize.define('Device', {
  device_id: {
      type: DataTypes.STRING(50),
    primaryKey: true
  },
  device_name: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.STRING(100),
      allowNull: false
  },
  device_secret: {
      type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    defaultValue: 'offline'
  },
  model_version: {
      type: DataTypes.STRING(50),
    allowNull: false
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
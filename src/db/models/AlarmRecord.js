const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const AlarmRecord = sequelize.define('AlarmRecord', {
  alarm_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'devices',
      key: 'device_id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  event_type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  event_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  video_path: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  handled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  alarm_message: {
    type: DataTypes.STRING(255),
    allowNull: true
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

module.exports = AlarmRecord; 
const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const AlarmRecord = sequelize.define('AlarmRecord', {
  alarm_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  device_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'device_id'
    }
  },
  alarm_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  alarm_type: {
    type: DataTypes.ENUM('fall', 'abnormal', 'other'),
    allowNull: false
  },
  confidence: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'false_alarm'),
    defaultValue: 'pending'
  },
  video_url: {
    type: DataTypes.STRING,
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
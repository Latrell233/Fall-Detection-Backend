const { DataTypes } = require('sequelize');
const sequelize = require('../index');

const Video = sequelize.define('Video', {
  video_id: {
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
  alarm_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'alarm_records',
      key: 'alarm_id'
    }
  },
  video_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
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

module.exports = Video; 
const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
const Video = sequelize.define('Video', {
  video_id: {
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
    video_path: {
      type: DataTypes.STRING(255),
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
    size: {
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

  return Video;
}; 
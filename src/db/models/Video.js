const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Video = sequelize.define('Video', {
    video_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    alarm_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'alarm_records',
        key: 'alarm_id'
      }
    },
    device_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'devices',
        key: 'device_id'
      }
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    video_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING(50),
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
    underscored: true,
    tableName: 'videos'
  });

  return Video;
}; 
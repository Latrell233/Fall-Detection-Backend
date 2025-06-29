const { DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Feedback = sequelize.define('Feedback', {
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    content: {
      type: DataTypes.TEXT,
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

  return Feedback;
}; 
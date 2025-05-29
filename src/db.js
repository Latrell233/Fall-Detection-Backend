const { Sequelize } = require('sequelize');
const config = require('../config/config');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fall_detection',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+08:00',
  define: {
    timestamps: true,
    underscored: true
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 加载所有模型
const models = {};
const modelsPath = path.join(__dirname, 'db', 'models');

fs.readdirSync(modelsPath)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(modelsPath, file))(sequelize);
    models[model.name] = model;
  });

// 设置模型关联
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  async connect() {
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
      return true;
    } catch (err) {
      console.error('Unable to connect to the database:', err);
      throw err;
    }
  },

  async close() {
    await sequelize.close();
  },

  getSequelize() {
    return sequelize;
  },

  getModels() {
    return models;
  }
};
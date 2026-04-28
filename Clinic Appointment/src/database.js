const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  // This creates a physical file in your project root
  storage: path.join(__dirname, '../database.sqlite'), 
  logging: false
});

module.exports = sequelize;
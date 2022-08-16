const Sequelize = require('sequelize');
const db = require('../db_setup.js');
const User = db.define('user', {
   id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
   },
   username: {
      type: Sequelize.STRING,
      allowNull: false
   },
   password: {
      type: Sequelize.STRING,
      allowNull: false
   }
}, {
   timestamps: false,
   underscored: true
});

module.exports = User;
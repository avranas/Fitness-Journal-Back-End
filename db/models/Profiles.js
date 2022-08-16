const Sequelize = require('sequelize');
const db = require('../db_setup.js');
const User = require('./Users.js');

const Profile = db.define('profile', {
   id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
   },
   starting_weight: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   goal_weight: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   start_date: {
      type: Sequelize.DATE,
      allowNull: false
   },
   max_chain: {
      type: Sequelize.INTEGER,
      allowNull: false
   },
   user_id: {
      type: Sequelize.INTEGER,
      allowNull: false
   },
}, {
   underscored: true
});

User.hasOne(Profile);
Profile.belongsTo(User);

module.exports = Profile;
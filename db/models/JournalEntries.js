const Sequelize = require('sequelize');
const db = require('../db_setup.js');
const User = require('./Users.js');

const JournalEntry = db.define('journal_entry', {
   id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
   },
   entry_date: {
      type: Sequelize.DATE,
      allowNull: false
   },
   weight: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   exercise_goal_met: {
      type: Sequelize.BOOLEAN,
      allowNull: false
   },
   caloric_intake: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   protein_intake: {
      type: Sequelize.FLOAT,
      allowNull: false
   },
   notes: {
      type: Sequelize.STRING
   },
   user_id: {
      type: Sequelize.FLOAT,
      allowNull: false
   }
}, {
   underscored: true
});

User.hasMany(JournalEntry);
JournalEntry.belongsTo(User);

module.exports = JournalEntry;
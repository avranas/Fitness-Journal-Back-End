const { Sequelize } = require('sequelize');
require("dotenv").config();

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
   host: process.env.DB_HOST,
   dialect: 'postgres',
   //I'm not sure if I need this, but it was in the tutorial
   pool: {
      max: 5,
      min: 0,
      aquire: 30000,
      idle: 10000
   },
   port: process.env.DB_PORT,
   timestamps: false,
   freezeTableName: true,
   /*
   Uncomment when you deploy - This will not work in development, but is required for testing. Don't ask me why
   dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
   }
   */
});

//Test database connection
db.authenticate()
   .then(() => console.log('Connection to database successful'))
   .catch(err => console.log('Connection to database unsuccessful :( ' + err));

module.exports = db;

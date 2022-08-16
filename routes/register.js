const express = require('express');
const bcrypt = require('bcrypt');
const registerRouter = express.Router();
const User = require('../db/models/Users.js')
const {checkNotAuthenticated} = require('./authentication-check.js');
const Profile = require('../db/models/Profiles.js');

/*
Example:
   {
      "username": "avranas",
      "password": "p@ssw0rd",
      "starting_weight": 198.6,
      "goal_weight": 168.6
   }
*/
registerRouter.post('/', checkNotAuthenticated, async (req, res) => {
   try {
      const username = req.body.username;
      const password = req.body.password;
      const startingWeight = req.body.starting_weight;
      const goalWeight = req.body.goal_weight;
      //First check to see if a user with that name already exists
      const result = await User.findOne({
         where: {username: username}
      });
      if(result){
         throw "A user with that name already exists";
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserResults = await User.create({
         username: username,
         password: hashedPassword
      });
      //Create a profile for the new user
      await Profile.create({
         starting_weight: startingWeight,
         goal_weight: goalWeight,
         start_date: new Date(), //Does this actually work the way I want?
         max_chain: 0,
         user_id: newUserResults.id
      });
      res.status(200).send(`Created new user: ${username}`);
   } catch (err) {
      next(err);
   }
});

module.exports = registerRouter;
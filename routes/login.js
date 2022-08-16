const express = require('express');
const passport = require('passport');
const loginRouter = express.Router();
const {checkNotAuthenticated} = require('./authentication-check.js');

loginRouter.post('/', checkNotAuthenticated, passport.authenticate('local', {}), (req, res, next) => {
   res.status(200).send(`Successfully logged in as: ${req.user.username}`);
});

module.exports = loginRouter;
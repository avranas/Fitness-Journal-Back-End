const express = require('express');
const logoutRouter = express.Router();
const {checkAuthenticated} = require('./authentication-check.js');

logoutRouter.get('/', checkAuthenticated, (req, res, next) => {
   //If a user is currently logged in
   if(req.user){
      req.logout( err =>{
         if(err){
            return next(err);
         }
      });
      res.status(200).send('You have been logged out');
   } else {
      res.status(200).send('No user is currently logged in')
   }
});

module.exports = logoutRouter;
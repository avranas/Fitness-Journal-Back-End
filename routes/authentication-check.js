const express = require('express');
const passport = require('passport');

//Middleware function to redirect user to a login page if they aren't logged in
function checkAuthenticated(req, res, next) {
   if (req.isAuthenticated()) {
     return next();
   }
   res.status(401).send('You need to be logged in to do that');
 }
 
 //Prevents logged in users to go to pages they aren't supposed to
 function checkNotAuthenticated(req, res, next) {
   if (req.isAuthenticated()) {
      res.status(401).send('You need to be logged out to do that');
   } else {
      next();
   }
 }

 function checkAdminAuthenticated(req, res, next) {
   if (req.isAuthenticated() && req.user.username === "admin") {
      return next();
   } else {
      res.status(401).send('You need admin privileges for that');
   }
 }

 module.exports = {checkAuthenticated, checkNotAuthenticated, checkAdminAuthenticated};